# Validated Token Example Contracts
## Status: DRAFT

Example code for the Vaidated Token EIP

## Architecture

The basic relationship of this protocol is very simple: there are validators
that expose two `check` functions:

* `check(address token, address user) returns (uint8 status)`
* `check(address token, address to, address from, uint256 amout) returns (uint8 status)`

```
    ┌──────┐
    │Caller|
    └─┬──↑─┘
      │  │
check │  │ status
      │  │
  ┌───↓──┴──┐
  │Validator│
  └─────────┘
```

Why list this as a `Caller` an not `Token`? Because validators may be arranged into
a DAG of validation dependencies. They may check `any` and `all` of their dependenies,
or have more complex logic, change which dependencies are required based on who
they're validating, and so on.

## Example

A somewhat contrived example is for a purchasing a holiday via the blockchain.
Here, we have `TravelToken`, which is your travel package (flight & hotel details, &c).
In order to purchase such a token, you need to be able to have a valid travel visa,
have all of your immunizations up to date, and prove tatyou are who you say you are.
In turn, the travel visa requires that you're not a crminal on a government watch list.

Each of these validation services may be operated variously by the travel agency,
governments, and identity services. By implementing the `TokenValidator` interface,
these validation services can interact with other validators to check information
that they don't own.

```
                 ┌───────────┐
                 │TravelToken|
Token            └─────┬─────┘
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┼┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
Validators     ┌───────┴───────┐
               │TravelValidator│
               └──┬────┬────┬──┘ ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                  │    │    │    ┊           Other
     ┌────────────┘    │    └────┼────────┐
     │                 │         ┊        │
┌────┴────┐      ┌─────┴────┐    ┊ ┌──────┴──────┐
│IDChecker│      │VisaIssuer│    ┊ │HealthRecords|
└────┬────┘      └─────┬────┘    ┊ └─────────────┘
     │                 │         └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
     └─────┐     ┌─────┘
           │     │
         ┌─┴─────┴─┐
         |WatchList|
         └─────────┘
```

## Links

* [EIP](https://github.com/Finhaven/EIPs/blob/validator/EIPS/eip-999.md)
