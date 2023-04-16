const { contracts } = require('../contracts/contracts.js');

async function verifyPublicInputs(publicKey, proof) {
    const sc = contracts.getContract("ZkpContract");

    try {
        const publicInputsMatch = await sc.methods.verifyPublicInputs(
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
            error: e,
        };
    }
}

async function verifyProof(proof) {
    const sc = contracts.getContract("ZkpContract");

    try {
        const proofStatus = await sc.methods.verifyProof(
            proof,
        ).call();

        if (proofStatus) {
            console.log(`Proof is valid`)
        } else {
            console.log(`Proof is invalid`)
        }

        return {
            valid_proof_of_provenance: proofStatus
        };
    } catch (e) {
        console.error(e);
        return {
            error: e,
        };
    }
}

module.exports = { verifyPublicInputs, verifyProof }
