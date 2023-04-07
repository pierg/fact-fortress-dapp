package main

import (
	"os"

	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/backend/groth16"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/frontend/cs/r1cs"
	"github.com/pierg/zkp-hackathon/gnark/common/pkg/circuit"
	"github.com/pierg/zkp-hackathon/gnark/common/pkg/utils"
)

func main() {
	// compil the circuit into a R1CS
	var circuit circuit.CubicCircuit
	ccs, _ := frontend.Compile(ecc.BN254.ScalarField(), r1cs.NewBuilder, &circuit)

	// setup groth16 zkSNARK
	pk, vk, _ := groth16.Setup(ccs)

	// generate the solidity smart contract
	f, err := os.Create("zkpProofVerifier.sol")
	if err != nil {
		panic(err)
	}
	err = vk.ExportSolidity(f)
	if err != nil {
		panic(err)
	}

	// backup ccs, pk, and vk
	utils.Backup("ccs.bin", ccs)
	utils.Backup("pk.bin", pk)
	utils.Backup("vk.bin", vk)
}
