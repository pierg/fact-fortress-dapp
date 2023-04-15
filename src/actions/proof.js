const { GrumpkinAddress } = require('@noir-lang/barretenberg/dest/address');
const { contracts } = require('../contracts/contracts.js');

async function verifyPublicInputs(publicKey, proof) {
    const sc = contracts.getContract("ZkpContract");

    const GrumpkinPublicKey = new GrumpkinAddress(Buffer.from(publicKey.replace(/^0x/i, ''), 'hex'));

    try {
        const publicKeyMatch = await sc.methods.verifyPublicKey(
            GrumpkinPublicKey.x(),
            GrumpkinPublicKey.y(),
            proof,
        ).call();

        if (publicKeyMatch) {
            console.log(`Proof ${proof} uses ${publicKey} as public input`)
        } else {
            console.log(`Proof ${proof} does NOT use ${publicKey} as public input`)
        }

        return {
            public_input_match: publicKeyMatch
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
            console.log(`Proof ${proof} is valid`)
        } else {
            console.log(`Proof ${proof} is invalid`)
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
