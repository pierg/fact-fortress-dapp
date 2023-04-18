const {
    setup_generic_prover_and_verifier,
} = require("@noir-lang/barretenberg/dest/client_proofs");
const { compile } = require("@noir-lang/noir_wasm");
const { resolve } = require("path");

const fs = require("fs");

const verifierPath = resolve(__dirname, "../contracts/zkpHealthVerifier.sol");
const verifierName = "ZkpHealthVerifier";

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

// Generate the verifier smart contract
// Note: should be used instead of the CLI (that currently generates an invalid smart contract)
async function generateVerifier() {
    console.log("Compiling the circuit");

    let sc;

    const compiledProgram = compile(
        resolve(__dirname, "../circuits/schnorr/src/main.nr")
    );
    const acir = compiledProgram.circuit;

    console.log("Generating the verifier");

    try {
        [_, verifier] = await setup_generic_prover_and_verifier(acir);
        sc = await verifier.SmartContract();
    } catch (e) {
        console.log(e);
        return;
    }

    console.log("Fixing the verifier smart contract");

    // update the name of the smart contract (`TurboVerifier` by default)
    sc = sc.replace(/TurboVerifier/g, verifierName);

    // fix the smart contract

    // list of variable names responsible for the `stack too deep` error
    const problematicVariables = ["intermediate"];
    problematicVariables.map((problematicVariable) => {
        // address the `stack too deep` error
        sc = fixStackTooDeepError(sc, problematicVariable);
    });

    console.log("Saving the verifier smart contract: ", verifierPath);

    try {
        fs.writeFileSync(verifierPath, sc);
    } catch (e) {
        console.log(e);
        return;
    }
}

generateVerifier().finally(() => {
    process.exit();
});