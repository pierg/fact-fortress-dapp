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
	// compiles the circuit into a R1CS
	var circuit circuit.CubicCircuit
	ccs, _ := frontend.Compile(ecc.BN254.ScalarField(), r1cs.NewBuilder, &circuit)

	// Setup groth16 zkSNARK
	pk, vk, _ := groth16.Setup(ccs)

	// Write solidity smart contract into a file
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
