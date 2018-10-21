const { expect } = require('chai');

const SimpleAuthorization = artifacts.require('SimpleAuthorization'); // eslint-disable-line no-undef
const ReferenceToken = artifacts.require('ReferenceToken'); // eslint-disable-line no-undef

const revertMessage = 'VM Exception while processing transaction: revert';

const expectRevert = async (func, msg = 'revert') => {
  try {
    await func();
    throw new Error('Expected EVM failure');
  } catch ({ message }) {
    expect(message).to.have.string(msg);
  }
};

contract('ReferenceToken', (accounts) => { // eslint-disable-line no-undef
  const name = 'testToken';
  const symbol = 'TKN';
  const granularity = 16;
  const amount = 100;

  const [, sender, receiver] = accounts;
  const [, targetAccount] = accounts;

  let simpleAuthorization;
  let referenceToken;

  beforeEach(async () => {
    simpleAuthorization = await SimpleAuthorization.new();

    referenceToken =
      await ReferenceToken.new(name, symbol, granularity, simpleAuthorization.address);
  });

  it('should get instance of reference token', () => {
    expect(referenceToken).to.not.be.null;
  });

  it('authorized should get tokens', async () => {
    await simpleAuthorization.setAuthorized(targetAccount, true);
    const mintResult = await referenceToken.mint(targetAccount, amount * granularity);
    const validationEvent = mintResult.logs[0];

    expect(validationEvent.event).to.equal('Validation');
    expect(validationEvent.args.user).to.equal(targetAccount);

    const balance = await referenceToken.balanceOf(targetAccount);
    expect(balance.toNumber()).to.equal(amount * granularity);
  });

  it('reference token receiver (mint) should be authorized', async () => {
    await expectRevert(
      () => referenceToken.mint(targetAccount, amount * granularity),
      revertMessage,
    );

    await simpleAuthorization.setAuthorized(targetAccount, true);
    await referenceToken.mint(targetAccount, amount * granularity);
  });

  it('reference token receiver (transfer) should be authorized', async () => {
    await simpleAuthorization.setAuthorized(sender, true);
    // await referenceToken.mint(sender, amount * granularity);
    await expectRevert(
      () => referenceToken.transfer(receiver, amount * granularity, { from: sender }),
      revertMessage,
    );

    const receiverBalance = await referenceToken.balanceOf(receiver);
    expect(receiverBalance.toNumber()).to.equal(0);
  });

  describe('transfer tokens', async () => {
    let authorized;
    let validationEvent;
    let receiverBalance;

    before(async () => {
      authorized =
        await simpleAuthorization.check.call(referenceToken.address, sender, receiver, amount);

      await simpleAuthorization.setAuthorized(sender, true);
      await simpleAuthorization.setAuthorized(receiver, true);
      await referenceToken.mint(sender, amount * granularity);

      const transferResult =
        await referenceToken.transfer(receiver, amount * granularity, { from: sender });

      validationEvent = transferResult.logs[0];
      receiverBalance = await referenceToken.balanceOf(receiver);
    });

    it('is an authorized transfer', () => {
      expect(authorized).to.equal('0x10');
    });

    it('emits a Validation event', () => {
      expect(validationEvent.event).to.equal('Validation');
    });

    it('is from the correct sender', () => {
      expect(validationEvent.args.from).to.equal(sender);
    });

    it('send the correct amount', () => {
      expect(validationEvent.args.value.toNumber()).to.eq(amount * granularity);
    });

    it('is going to the correct receiver', () => {
      expect(validationEvent.args.to).to.eq(receiver);
    });

    it('has the correct final balance', async() => {
      expect(receiverBalance.toNumber()).to.eq(amount * granularity);
    });
  });
});
