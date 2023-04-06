package main

import (
	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/backend/groth16"
	"github.com/consensys/gnark/backend/witness"
	"github.com/fatih/color"
	"github.com/pierg/zkp-hackathon/gnark/common/pkg/utils"
)

func main() {
	// get vk, the proof, and the public witness from backup files
	vk := groth16.NewVerifyingKey(ecc.BN254)
	proof := groth16.NewProof(ecc.BN254)
	publicWitness, _ := witness.New(ecc.BN254.ScalarField())

	vkBin := utils.Restore("../generate/vk.bin")
	vk.ReadFrom(vkBin)

	proofBin := utils.Restore("../prove/proof.bin")
	proof.ReadFrom(proofBin)

	publicWitnessBin := utils.Restore("../prove/publicWitness.bin")
	publicWitness.ReadFrom(publicWitnessBin)

	// verify the proof
	if err := groth16.Verify(proof, vk, publicWitness); err != nil {
		color.Red("Verification: reject (%v)", err)
	} else {
		color.Green("Verification: accept")
	}
}
