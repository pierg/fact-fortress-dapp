# ZKP Contract

Contract: `smart_contracts/Ethereum/ZkpContract/contracts/zkpContract.sol`

## Prerequisites

* [install pnpm](https://pnpm.io/installation)
* Install the dependencies (from `./smart_contracts/Ethereum/ZkpContract/`): `pnpm i`

## Circuit 

The Noir-generated circuit is defined in `./smart_contracts/Ethereum/ZkpContract/circuits/src/main.nr`

If updated, the tests will fail until the third parameter of every call to `create_proof` is updated accordingly.

## Test the contract

From `./smart_contracts/Ethereum/ZkpContract/`:

```
pnpm run test
```

Check specifically: 

* `should verify a proof — valid proof`
* `should verify a proof — invalid proof`

### Notes

The verification tests are launched twice:

* First, to directly test the verifier contract — `Contract: ZkpVerifier`
* Second, to indirectly test the verification through the main contract — `Contract: ZkpContract`

For the purposes of tests related to `ZkpContract`, the verifying smart contract is compile using `nargo codegen-verifier`, and the default contract name `TurboVerifier` is replaced with `ZkpVerifier`.
