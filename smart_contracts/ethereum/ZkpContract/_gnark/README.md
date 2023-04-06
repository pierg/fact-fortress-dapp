# Gnark [WIP]

## Run

```
# first, generate the smart contract and the setup parameters
cd generate
go run main.go

# then, generate the proof
cd ../prove
go run main.go

# last, verify offchain
cd ../verify_offchain
go run main.go
```
