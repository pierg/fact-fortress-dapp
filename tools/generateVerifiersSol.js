const {
    setup_generic_prover_and_verifier,
} = require("@noir-lang/barretenberg/dest/client_proofs");
const { compile } = require("@noir-lang/noir_wasm");
const { resolve } = require("path");

const fs = require("fs");

// get the indices of the first and last occurences of a given problematic variable
function getIndices(code, problematicVariable) {
    const lines = code.split("\n");
    let firstIndices = [];
    let lastIndices = [];

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`${problematicVariable} := `)) {
            firstIndices.push(i);
        } else if (lines[i].includes(problematicVariable)) {
            lastIndices.push(i);
        }
    }

    return {
        first: firstIndices,
        last: lastIndices,
    };
}

// fix the `stack too deep` error using block scoping
function fixStackTooDeepError(code, problematicVariable) {
    const lines = code.split("\n");
    const indices = getIndices(code, problematicVariable);
    let variableCount = 0;
    let newVariableName;

    for (let i = 0; i < lines.length; i++) {
        let currentLine = lines[i];

        if (indices.first.includes(i)) {
            newVariableName = `${problematicVariable}_${variableCount}`;

            // remove the first `let`
            currentLine = currentLine.replace("let ", "");

            // define the new variable
            currentLine = currentLine.replace(
                problematicVariable,
                `let ${newVariableName}`
            );

            // open the local scope
            lines[i] = `\t\t{\n${currentLine}`;

            variableCount++;
        } else if (indices.last.includes(i)) {
            // use the new variable
            currentLine = currentLine.replace(problematicVariable, newVariableName);

            // close the local scope
            lines[i] = `${currentLine}\n\t\t}`;
        }
    }
    return lines.join("\n");
}

// Generate the verifier smart contracts
// Note: should be used instead of the CLI (that currently generates an invalid smart contract)
async function generateVerifiers(verifierCircuits) {
    for (const circuit of verifierCircuits) {
        const verifierCircuitName = circuit.circuit_name;
        const verifierContractName = circuit.contract_name;
        const circuitPath = resolve(__dirname, `../circuits/${verifierCircuitName}/src/main.nr`);
        const verifierPath = resolve(__dirname, `../contracts/${verifierContractName}.sol`);

        console.log(`---- Compiling circuit ${verifierCircuitName} ----`);

        // guard clause: ensure that the circuit exists
        if (!fs.existsSync(circuitPath)) {
            console.log(`Error: circuit ${verifierCircuitName} (${circuitPath}) does not exist`);
            return;
        }

        let sc, compiledProgram;

        try {
            compiledProgram = compile(circuitPath);
        } catch (e) {
            console.log(`Compilation error: ${e}`);
            return;
        }

        const acir = compiledProgram.circuit;

        console.log("generating the verifier");

        try {
            const [_, verifier] = await setup_generic_prover_and_verifier(acir);
            sc = await verifier.SmartContract();
        } catch (e) {
            console.log(e);
            return;
        }

        console.log("fixing the verifier smart contract");

        // update the name of the smart contract (TurboVerifier bydefault)
        sc = sc.replace(/TurboVerifier/g, verifierContractName);

        // fix the smart contract

        // list of variable names responsible for the stack too deep error
        const problematicVariables = ["intermediate"];
        problematicVariables.map((problematicVariable) => {
            // address the stack too deep error
            sc = fixStackTooDeepError(sc, problematicVariable);
        });

        console.log("Saving the verifier smart contract: ", verifierPath);

        try {
            fs.writeFileSync(verifierPath, sc);
        } catch (e) {
            console.log(e);
            return;
        }

        console.log(`► ${verifierCircuitName} circuit → ${verifierContractName} smart contract (${verifierPath}) ✓`);
    }
}

// TODO(Guillaume): enable other contracts once the Noir bug is fixed
const verifierCircuits = [{
    "circuit_name": "schnorr", // name of the directory that contains the circuit 
    "contract_name": "VerifierProvenance" // name of the smart contract to generated
}, ]

generateVerifiers(verifierCircuits).finally(() => {
    process.exit();
});