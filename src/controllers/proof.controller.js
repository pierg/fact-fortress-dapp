const { verifyProof, verifyPublicInputsPoP } = require("./../actions/proof.js");
const { computeProof } = require("../frontend_helpers/proof.js");

async function generateProofController(
    req,
    res,
    next
) {
    let statement_function = req.body.statement_function;

    // TODO(Guillaume): remove once several contracts are supported
    if (!statement_function) {
        statement_function = "proof_of_provenance";
    }

    const result = await computeProof(statement_function, req.body);

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

async function verifyProofController(
    req,
    res,
    next
) {

    const statementFunction = req.query.statement_function;
    if (!statementFunction) {
        return res.status(500).json({
            error: "no statement function has been provided",
            expected_url: "/verify_proof?statement_function={statement_function}",
        });
    }

    const proof = req.body;
    if (!proof) {
        return res.status(500).json({
            error: "no proof has been provided in the body of the request",
        });
    }

    const result = await verifyProof(statementFunction, proof);

    if (result.error) {
        res.status(500).json(result);
    } else {
        res.status(200).json(result);
    }
}


module.exports = {
    generateProofController,
    verifyPublicInputsPoPController,
    verifyProofController,
}