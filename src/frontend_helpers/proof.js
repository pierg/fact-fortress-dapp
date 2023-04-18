const {
    setup_generic_prover_and_verifier,
    create_proof,
} = require("@noir-lang/barretenberg/dest/client_proofs");
const { compile } = require("@noir-lang/noir_wasm");
const { resolve } = require("path");
const { BarretenbergWasm } = require("@noir-lang/barretenberg/dest/wasm");
const { BarretenbergHelper } = require("./../../test/helpers.js");
const { contracts } = require("./../contracts/contracts.js");

const fs = require("fs");

let barretenbergHelper, circuitHelper;

class CircuitHelper {
    constructor() {
        this.circuits = {};
    }

    async add(circuitName, abiGenerator) {
        const circuitFilepath = resolve(
            __dirname,
            `../../circuits/${circuitName}/src/main.nr`
        );

        if (!fs.existsSync(circuitFilepath)) {
            console.error(`circuit ${circuitSchnorrFilepath} does not exist`);
            process.exit(1);
        }

        let compiledCircuit;

        try {
            compiledCircuit = compile(circuitFilepath);
        } catch (e) {
            console.log(e);
            process.exit(1);
        }

        this.circuits[circuitName] = {};
        this.circuits[circuitName].abiGenerator = abiGenerator;
        this.circuits[circuitName].acir = compiledCircuit.circuit;
        const [prover, verifier] = await setup_generic_prover_and_verifier(
            compiledCircuit.circuit,
        );

        this.circuits[circuitName].prover = prover;
        this.circuits[circuitName].verifier = verifier;
    }

    generateAbi(circuitName, args) {
        return this.circuits[circuitName].abiGenerator(args);
    }

    async generateProof(circuitName, abi) {
        return create_proof(
            this.circuits[circuitName].prover,
            this.circuits[circuitName].acir,
            abi,
        );
    }
}

async function initCircuitsHelpers() {
    console.log('---------- initializing verifiers ----------');
    const barretenbergWasm = await BarretenbergWasm.new();
    barretenbergHelper = new BarretenbergHelper(barretenbergWasm);
    circuitHelper = new CircuitHelper();

    for (const contractName in contracts.contracts) {
        const contract = contracts.contracts[contractName];
        if (contract.is_verifier) {
            console.log(`Initializing verifier ${contractName}`);
            const circuitName = contracts.contracts[contractName].circuit_name;
            await circuitHelper.add(circuitName, contract.abi_generator);
        }
    }

    console.log("► initialized verifiers ✓");
}

async function computeProof(healthFunction, args) {
    const contract = contracts.getContractByHealthFunction(healthFunction);
    let circuitName;

    // TODO(Guillaume): remove once the other verifiers are implemented
    if (!contract || !contract.circuit_name) {
        circuitName = "schnorr";
    } else {
        circuitName = contract.circuit_name;
    }

    const abi = circuitHelper.generateAbi(circuitName, args);

    return [...await circuitHelper.generateProof(circuitName, abi)];
}

module.exports = { initCircuitsHelpers, computeProof };