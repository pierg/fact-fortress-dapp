# Generate Verifying Smart Contract with Noir (WIP)

```
cd generate
pnpm i
pnpm run generate
```

## TODO

* use `nargo codegen-verifier` to generate the smart contract instead of programmatically 
* generate the proof and verify it _offchain_
* test onchain proof verification (`function verify(bytes calldata)`) with hardcoded proof
* programmatically generate the proof and test 
