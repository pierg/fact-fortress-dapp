const { contractsHelper } = require('../contracts/contracts.js');

async function verifyPublicInputsPoP(publicKey, proof) {
    const sc = contractsHelper.getContractByName("ZkpHealth");

    try {
        const publicInputsMatch = await sc.methods.verifyPublicInputsPoP(
            publicKey,
            proof,
        ).call();

        if (publicInputsMatch) {
            console.log(`Proof uses ${publicKey} as public input`)
        } else {
            console.log(`Proof does NOT use ${publicKey} as public input`)
        }

        return {
            public_input_match: publicInputsMatch
        };
    } catch (e) {
        console.error(e);
        return {
            public_input_match: false,
            error: e,
        };
    }
}

async function verifyProof(healthFunction, proof) {
    const sc = contractsHelper.getContractByName("ZkpHealth");

    try {
        const proofStatus = await sc.methods.verifyProof(
            healthFunction, proof,
        ).call();

        if (proofStatus) {
            console.log(`
            Proof is valid `)
        } else {
            console.log(`
            Proof is invalid `)
        }

        return {
            valid_proof_of_provenance: proofStatus
        };
    } catch (e) {
        console.error(e);
        return {
            valid_proof_of_provenance: false,
            error: e,
        };
    }
}

module.exports = { verifyPublicInputsPoP, verifyProof }