# Validated Token Example Contracts

## Status: `DRAFT`

[![Build Status](https://travis-ci.org/expede/validated-token.svg?branch=master)](https://travis-ci.org/expede/validated-token)
[![Maintainability](https://api.codeclimate.com/v1/badges/ed1d4e37934c28c0fa5a/maintainability)](https://codeclimate.com/github/expede/validated-token/maintainability)
[![ERC902](https://img.shields.io/badge/ERC-902-386.svg)](https://eips.ethereum.org/EIPS/eip-902)
[![ERC1066](https://img.shields.io/badge/ERC-1066-42A.svg)](https://eips.ethereum.org/EIPS/eip-1066)

## Architecture

The basic relationship of this protocol is very simple: there are validators that expose two `check` functions:

```solidity
check(address token, address user) returns (byte status)
check(address token, address to, address from, uint256 amout) returns (byte status)
```

Why list this as a `Caller` and not `Token`? Because validators may be arranged into a DAG of validation dependencies. They may check `any` and `all` of their dependencies, or have more complex logic, change which dependencies are required based on who they're validating, and so on.

# Interface

```solidity
interface TokenValidator {
    function check(
        address _token,
        address _subject
    ) public returns(byte statusCode)

    function check(
        address _token,
        address _from,
        address _to,
        uint256 _amount
    ) public returns (byte statusCode)
}
```

# Architecture

## Isolated

```
        +--------+
        │ Caller |
        +--------+
           │  ↑
check(...) │  │ statusCode
           ↓  │
      +-----------+
      | Validator |
      +-----------+
```

Here `Caller` may be a token, another `Validator`, an exchange (directly checking), or a user verifying that they will be authorized to perform some action.

## Stacked

(With example ERC1066 status codes for flavour)

```
        +-------+
        │ Token |
        +-------+
           │  ↑
check(...) │  │ 0x11
           ↓  │          check(...)
      +------------+   ------------->   +------------+
      | ValidatorA |                    | ValidatorC |
      +------------+   <-------------   +------------+
           │  ↑             0x21             │  ↑
check(...) │  │ 0x11              check(...) │  │ 0x31
           ↓  │                              ↓  │
      +------------+                    +------------+
      | ValidatorB |                    | ValidatorD |
      +------------+                    +------------+
```

# Example Diagram

A somewhat contrived example is for purchasing a holiday via the blockchain. Here, we have `TravelToken`, which is your travel package (flight & hotel details, &c). In order to purchase such a token, you need to be able to have a valid travel visa, have all of your immunizations up to date, and prove that you are who you say you are. In turn, the travel visa requires that you're not a crminal on a government watch list.

Each of these validation services may be operated variously by the travel agency, governments, and identity services. By implementing the `TokenValidator` interface, these validation services can interact with other validators to check information that they don't own.

![](https://raw.githubusercontent.com/expede/validated-token/master/assets/diagram.png?token=ABANcIE7drQhztiQvBrtwOeLgKnXAWifks5aljr9wA%3D%3D)

## Links

* [EIP](https://eips.ethereum.org/EIPS/eip-902)
