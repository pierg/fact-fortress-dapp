// Import the smart contract
const ZkpVerifier = artifacts.require("ZkpVerifier");

const { setup_generic_prover_and_verifier, create_proof, verify_proof } = require('@noir-lang/barretenberg/dest/client_proofs');
const { compile } = require('@noir-lang/noir_wasm');
const { resolve } = require('path');

const chai = require('chai').use(require('chai-as-promised'))
const expect = chai.expect;

const fs = require('fs');

contract("ZkpVerifier", (accounts) => {
    let zkpVerifierInstance;
    let compiledProgram;
    let acir, prover, verifier;

    before(async() => {
        compiledProgram = compile(resolve(__dirname, '../circuits/src/main.nr'));
        acir = compiledProgram.circuit;
        [prover, verifier] = await setup_generic_prover_and_verifier(acir);

        // // (enable to generate the smart contract)
        // const sc = await verifier.SmartContract();  
        // fs.writeFileSync(resolve(__dirname, "../contracts/zkpVerifier.sol"), sc);
    })

    beforeEach(async() => {
        zkpVerifierInstance = await ZkpVerifier.new();
    });

    it("should verify a proof — valid proof", async() => {
        let abi = {
            message: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            pub_key_x: "0x17cbd3ed3151ccfd170efe1d54280a6a4822640bf5c369908ad74ea21518a9c5",
            pub_key_y: "0x0e0456e3795c1a31f20035b741cd6158929eeccd320d299cfcac962865a6bc74",
            signature: [
                5, 202, 31, 146, 81, 242, 246, 69, 43, 107, 249, 153, 198, 44, 14, 111, 191, 121, 137, 166,
                160, 103, 18, 181, 243, 233, 226, 95, 67, 16, 37, 128, 85, 76, 19, 253, 30, 77, 192, 53, 138,
                205, 69, 33, 236, 163, 83, 194, 84, 137, 184, 221, 176, 121, 179, 27, 63, 70, 54, 16, 176,
                250, 39, 239,
            ]
        }

        const proof = await create_proof(prover, acir, abi);
        const verified = await verify_proof(verifier, proof);

        expect(verified).eq(true);

        const smartContractResult = await zkpVerifierInstance.verify(proof);
        expect(smartContractResult).eq(true);
    });

    it("should verify a proof — invalid proof", async() => {
        let abi = {
            message: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            pub_key_x: "0xaaabd3ed3151ccfd170efe1d54280a6a4822640bf5c369908ad74ea21518a9c5",
            pub_key_y: "0xbbb456e3795c1a31f20035b741cd6158929eeccd320d299cfcac962865a6bc74",
            signature: [
                5, 202, 31, 146, 81, 242, 246, 69, 43, 107, 249, 153, 198, 44, 14, 111, 191, 121, 137, 166,
                160, 103, 18, 181, 243, 233, 226, 95, 67, 16, 37, 128, 85, 76, 19, 253, 30, 77, 192, 53, 138,
                205, 69, 33, 236, 163, 83, 194, 84, 137, 184, 221, 176, 121, 179, 27, 63, 70, 54, 16, 176,
                250, 39, 239,
            ]
        }

        const proof = await create_proof(prover, acir, abi);
        const verified = await verify_proof(verifier, proof);

        expect(verified).eq(false);

        await expect(zkpVerifierInstance.verify(proof))
            .to.be.rejectedWith("VM Exception while processing transaction: revert Proof failed");
    });
});