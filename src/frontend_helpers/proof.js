const {
    setup_generic_prover_and_verifier,
    create_proof,
} = require("@noir-lang/barretenberg/dest/client_proofs");
const { compile } = require("@noir-lang/noir_wasm");
const { resolve } = require("path");
const { BarretenbergWasm } = require("@noir-lang/barretenberg/dest/wasm");
const { BarretenbergHelper } = require("../../test/helpers.js");
const { contractsHelper } = require("../contracts/contracts.js");
const clc = require('cli-color');

const fs = require("fs");

let circuitHelper;

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
            console.error(`circuit ${circuitFilepath} does not exist`);
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

// required for the demo to assist the frontend to generate proofs 
async function initCircuitsHelpers() {
    circuitHelper = new CircuitHelper();

    for (const contractName in contractsHelper.contracts) {
        const contract = contractsHelper.contracts[contractName];
        if (contract.is_verifier) {
            const circuitName = contractsHelper.contracts[contractName].circuit_name;
            await circuitHelper.add(circuitName, contract.abi_generator);
        }
    }
}

async function computeProof(statementFunction, args) {
    const contract = contractsHelper.getContractByStatementFunction(statementFunction);

    // guard clause: ensure the function exists
    if (!contract) {
        return {
            "error": `Statement function ${statementFunction} is not implemented`
        }
    }

    const circuitName = contract.circuit_name;

    const abi = circuitHelper.generateAbi(circuitName, args);

    return [...await circuitHelper.generateProof(circuitName, abi)];
}

module.exports = { initCircuitsHelpers, computeProof };