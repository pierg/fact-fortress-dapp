// Import the smart contract
const ZkpVerifier = artifacts.require("ZkpVerifier");

const { setup_generic_prover_and_verifier, create_proof, verify_proof, StandardExampleProver, StandardExampleVerifier } = require('@noir-lang/barretenberg/dest/client_proofs');
const { compile } = require('@noir-lang/noir_wasm');
const { resolve } = require('path');

const chai = require('chai').use(require('chai-as-promised'))
const expect = chai.expect;

contract("ZkpVerifier", (accounts) => {
    let zkpVerifierInstance;
    let compiledProgram;
    let acir, prover, verifier;

    before(async() => {
        compiledProgram = compile(resolve(__dirname, '../circuits/src/main.nr'));
        acir = compiledProgram.circuit;
        [prover, verifier] = await setup_generic_prover_and_verifier(acir);
    })

    beforeEach(async() => {
        zkpVerifierInstance = await ZkpVerifier.new();
    });

    it("should verify a proof — valid proof", async() => {
        // valid proof: x != y
        let abi = {
            x: 1,
            y: 2
        }

        const proof = await create_proof(prover, acir, abi);
        const verified = await verify_proof(verifier, proof);

        expect(verified).eq(true);

        const smartContractResult = await zkpVerifierInstance.verify(proof);
        expect(smartContractResult).eq(true);
    });

    it("should verify a proof — invalid proof", async() => {
        // invalid proof: x == y
        let abi = {
            x: 1,
            y: 1
        }

        const proof = await create_proof(prover, acir, abi);
        const verified = await verify_proof(verifier, proof);

        expect(verified).eq(false);

        await expect(zkpVerifierInstance.verify(proof))
            .to.be.rejectedWith("VM Exception while processing transaction: revert Proof failed");
    });
});