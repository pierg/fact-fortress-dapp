const { setup_generic_prover_and_verifier, create_proof, verify_proof } = require('@noir-lang/barretenberg/dest/client_proofs');
const { compile } = require('@noir-lang/noir_wasm');
const { resolve } = require('path');
const { BarretenbergWasm } = require('@noir-lang/barretenberg/dest/wasm');
const { BarretenbergHelper } = require('./../../test/helpers.js');
const fs = require('fs');

let barretenbergHelper, proofHelper;

const circuitFilepath = resolve(__dirname, '../../circuits/src/main.nr');

class ProofHelper {
    constructor() {
        if (!fs.existsSync(circuitFilepath)) {
            console.error(`circuit ${circuitFilepath} does not exist`)
            process.exit(1);
        }

        try {
            this.compiledProgram = compile(circuitFilepath);
        } catch (e) {
            console.log(e);
            process.exit(1);
        }
    }

    async setup() {
        this.acir = this.compiledProgram.circuit;
        let [prover, verifier] = await setup_generic_prover_and_verifier(this.acir);

        this.prover = prover;
        this.verifier = verifier;
    }

    async create_proof(abi) {
        return create_proof(this.prover, this.acir, abi)
    }
}

async function computeProof(publicKey, hash, signature) {
    if (typeof barretenbergHelper === undefined || !barretenbergHelper) {
        const barretenbergWasm = await BarretenbergWasm.new();
        barretenbergHelper = new BarretenbergHelper(barretenbergWasm);
    }

    if (typeof proofHelper === undefined || !proofHelper) {
        proofHelper = new ProofHelper();
        await proofHelper.setup();
    }

    const abi = barretenbergHelper.generateAbi(publicKey, hash, signature);
    proof = await proofHelper.create_proof(abi);
    return [...proof];
}

module.exports = { computeProof }
