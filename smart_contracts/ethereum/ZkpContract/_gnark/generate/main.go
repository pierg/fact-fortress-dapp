package main

import (
	"bufio"
	"fmt"
	"io"
	"os"

	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/backend/groth16"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/frontend/cs/r1cs"
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

func backup(file string, x io.WriterTo) {
	fmt.Printf("Saving %s\n", file)
	f, err := os.Create(file)
	if err != nil {
		panic(err)
	}
	defer f.Close()
	w := bufio.NewWriter(f)
	written, err := x.WriteTo(w)
	if err != nil {
		panic(err)
	}
	fmt.Printf("Saved %d bytes\n", written)
	w.Flush()

}

func main() {
	// compiles the circuit into a R1CS
	var circuit CubicCircuit
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
	backup("ccs.bin", ccs)
	backup("pk.bin", pk)
	backup("vk.bin", vk)
}
