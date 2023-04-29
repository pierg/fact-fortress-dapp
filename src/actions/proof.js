const { contractsHelper } = require('../contracts/contracts.js');
const clc = require('cli-color');

async function verifyPublicInputsPoP(publicKey, proof) {
    const sc = contractsHelper.getContractByName("FactFortress");
    let publicInputsMatch;

    try {
        publicInputsMatch = await sc.methods.verifyPublicInputsPoP(
            publicKey,
            proof,
        ).call();

        return {
            public_input_match: publicInputsMatch
        };
    } catch (e) {
        console.error(e);
        return {
            public_input_match: false,
            error: e,
        };
    } finally {
        if (publicInputsMatch) {
            console.log(clc.green(`Proof uses ${publicKey} as public input`))
        } else {
            console.log(clc.red(`Proof does NOT use ${publicKey} as public input`))
        }
    }
}

async function verifyProof(statementFunction, proof) {
    const sc = contractsHelper.getContractByName("FactFortress");
    let proofStatus;

    try {
        proofStatus = await sc.methods.verifyProof(
            statementFunction, proof,
        ).call();

        return {
            valid_proof_of_provenance: proofStatus
        };
    } catch (e) {
        console.error(e);
        return {
            valid_proof_of_provenance: false,
            error: e,
        };
    } finally {
        if (proofStatus) {
            console.log(clc.green(`Proof is valid `))
        } else {
            console.log(clc.red(`Proof is invalid `))
        }
    }
}
module.exports = { verifyPublicInputsPoP, verifyProof }