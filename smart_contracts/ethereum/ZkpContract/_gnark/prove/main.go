package main

import (
	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/backend/groth16"
	"github.com/consensys/gnark/frontend"
	"github.com/pierg/zkp-hackathon/gnark/common/pkg/circuit"
	"github.com/pierg/zkp-hackathon/gnark/common/pkg/utils"
)

func main() {
	// get ccs, pk, and vk from backup files
	ccs := groth16.NewCS(ecc.BN254)
	pk := groth16.NewProvingKey(ecc.BN254)
	vk := groth16.NewVerifyingKey(ecc.BN254)

	pkBin := utils.Restore("../generate/pk.bin")
	pk.ReadFrom(pkBin)

	vkBin := utils.Restore("../generate/vk.bin")
	vk.ReadFrom(vkBin)

	cssBin := utils.Restore("../generate/ccs.bin")
	ccs.ReadFrom(cssBin)

	// witness definition
	assignment := circuit.CubicCircuit{X: 3, Y: 35}
	witness, _ := frontend.NewWitness(&assignment, ecc.BN254.ScalarField())
	publicWitness, _ := witness.Public()

	proof, _ := groth16.Prove(ccs, pk, witness)

	utils.Backup("proof.bin", proof)
	utils.Backup("publicWitness.bin", publicWitness)
}
