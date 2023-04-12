// Import the smart contract
const ZkpVerifier = artifacts.require("ZkpVerifier");

const { setup_generic_prover_and_verifier, create_proof, verify_proof } = require('@noir-lang/barretenberg/dest/client_proofs');
const { compile } = require('@noir-lang/noir_wasm');
const { resolve } = require('path');
const { randomBytes, sign } = require('crypto');

const chai = require('chai').use(require('chai-as-promised'))
const expect = chai.expect;

const fs = require('fs');

contract("ZkpVerifier", (accounts) => {
    // (enable to generate the smart contract)

    // it("generate a new contract", async () => {
    //     compiledProgram = compile(resolve(__dirname, '../circuits/src/main.nr'));
    //     acir = compiledProgram.circuit;
    //     [prover, verifier] = await setup_generic_prover_and_verifier(acir);
    //     const sc = await verifier.SmartContract();
    //     fs.writeFileSync(resolve(__dirname, "../contracts/zkpVerifier.sol"), sc);
    // });
});