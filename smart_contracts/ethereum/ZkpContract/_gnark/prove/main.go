package main

import (
	"fmt"
	"os"

	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/backend/groth16"
	"github.com/consensys/gnark/frontend"
)

// CubicCircuit defines a simple circuit
// x**3 + x + 5 == y
type CubicCircuit struct {
	// struct tags on a variable is optional
	// default uses variable name and secret visibility.
	X frontend.Variable `gnark:"x"`
	Y frontend.Variable `gnark:",public"`
}

// Define declares the circuit constraints
// x**3 + x + 5 == y
func (circuit *CubicCircuit) Define(api frontend.API) error {
	x3 := api.Mul(circuit.X, circuit.X, circuit.X)
	api.AssertIsEqual(circuit.Y, api.Add(x3, circuit.X, 5))
	return nil
}

func main() {
	readFrom := func(file string) *os.File {
		f, err := os.OpenFile(file, os.O_RDONLY, os.ModePerm)
		if err != nil {
			panic(err)
		}
		return f
	}

	// get ccs, pk, and vk from backup files
	ccs := groth16.NewCS(ecc.BN254)
	pk := groth16.NewProvingKey(ecc.BN254)
	vk := groth16.NewVerifyingKey(ecc.BN254)

	pkBin := readFrom("../generate/pk.bin")
	fmt.Printf("%+v\n", pkBin)
	pk.ReadFrom(pkBin)

	vkBin := readFrom("../generate/vk.bin")
	vk.ReadFrom(vkBin)

	cssBin := readFrom("../generate/ccs.bin")
	_, err := ccs.ReadFrom(cssBin)
	if err != nil {
		panic(err)
	}

	// witness definition
	assignment := CubicCircuit{X: 3, Y: 35}
	witness, _ := frontend.NewWitness(&assignment, ecc.BN254.ScalarField())
	publicWitness, _ := witness.Public()

	proof, _ := groth16.Prove(ccs, pk, witness)

	fmt.Println("------ proof ------")
	fmt.Println(proof)

	fmt.Println("------ public witness ------")
	fmt.Println(publicWitness)
}
