const { storeSignature } = require("./../actions/publicInputs.js");
const {
    generateKeyPair,
    signHash,
    signMessage,
} = require("../frontend_helpers/keypair.js");
const { getFrom } = require("./common.controller.js");

async function uploadSignatureController(
    req,
    res,
    next
) {
    const from = getFrom(req);
    if (typeof from === undefined || !from) {
        return res.status(500).json({
            error: "`from` header is not properly set",
            expected_header: '{ "from": "providerA|providerB|providerC" }',
        });
    }

    const publicKey = req.query.public_key;
    if (!publicKey) {
        return res.status(500).json({
            error: "no public key has been provided",
            expected_url: "/signature?public_key={public_key}",
        });
    }

    const signature = req.body["signature"];
    if (!signature) {
        return res.status(500).json({
            error: "no signature has been provided in the body of the request",
        });
    }

    const result = await storeSignature(from, publicKey, signature);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function generateKeyPairController(
    req,
    res,
    next
) {
    const result = await generateKeyPair();

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function signHashController(
    req,
    res,
    next
) {
    const privateKey = req.body["private_key"];
    if (!privateKey) {
        return res.status(500).json({
            error: "no private key has been provided in the body of the request",
        });
    }

    // message to hash and sign (i.e., health data)
    const hash = req.body["hash"];
    if (!hash) {
        return res.status(500).json({
            error: "no hash has been provided in the body of the request",
        });
    }

    const result = await signHash(privateKey, hash);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function signMessageController(
    req,
    res,
    next
) {
    const privateKey = req.body["private_key"];
    if (!privateKey) {
        return res.status(500).json({
            error: "no private key has been provided in the body of the request",
        });
    }

    // message to hash and sign (i.e., health data)
    const message = req.body["message"];
    if (!message) {
        return res.status(500).json({
            error: "no message has been provided in the body of the request",
        });
    }

    const result = await signMessage(privateKey, message);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

module.exports = {
    generateKeyPairController,
    uploadSignatureController,
    signHashController,
    signMessageController
}