const { verifyProofPoP, verifyPublicInputsPoP } = require("./../actions/proof.js");
const { computeProof } = require("./../frontend_helpers/proof.js");

async function generateProofController(
    req,
    res,
    next
) {
    const publicKey = req.query.public_key;
    if (!publicKey) {
        return res.status(500).json({
            error: "no public key has been provided",
            expected_url: "/generate_proof?public_key={public_key}",
        });
    }

    const hash = req.body["hash"];
    if (!hash) {
        return res.status(500).json({
            error: "no hash has been provided in the body of the request",
        });
    }

    const signature = req.body["signature"];
    if (!signature) {
        return res.status(500).json({
            error: "no signature has been provided in the body of the request",
        });
    }

    const result = await computeProof(publicKey, hash, signature);

    if (result == null) {
        res.status(500).json({
            error: "Barretenberg Module not initialized yet",
        });
    } else if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function verifyPublicInputsPoPController(
    req,
    res,
    next
) {
    const publicKey = req.query.public_key;
    if (!publicKey) {
        return res.status(500).json({
            error: "no public key has been provided",
            expected_url: "/verify_public_inputs?public_key={public_key}",
        });
    }

    const proof = req.body;
    if (!proof) {
        return res.status(500).json({
            error: "no proof has been provided in the body of the request",
        });
    }

    const result = await verifyPublicInputsPoP(publicKey, proof);

    if (result.error) {
        res.status(500).json(result);
    } else {
        res.status(200).json(result);
    }
}

async function verifyProofPoPController(
    req,
    res,
    next
) {
    const proof = req.body;
    if (!proof) {
        return res.status(500).json({
            error: "no proof has been provided in the body of the request",
        });
    }

    const result = await verifyProofPoP(proof);

    if (result.error) {
        res.status(500).json(result);
    } else {
        res.status(200).json(result);
    }
}


module.exports = {
    generateProofController,
    verifyPublicInputsPoPController,
    verifyProofPoPController,
}