# Gnark: Generate [WIP]

Generate the smart contract that verifies the proofs and save the constraint system as well as `pk` and `vk`.

## Run

```
go run main.go
```

## Expected output

* `zkpProofVerifier.sol` — auto-generated smart contract to verify proofs
* `ccs.bin` — constraint system
* `pk.bin`
* `vk.bin`
