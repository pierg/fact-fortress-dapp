const {
    setPublicKey,
    getPublicKey,
    resetPublicKeys,
} = require("./../actions/publicInputs.js");
const { getFrom } = require("./common.controller.js");

async function getPublicKeyController(
    req,
    res,
    next
) {
    expected_url = "/publickey?name={name}&version={version}";

    const name = req.query.name;
    if (!name) {
        return res.status(500).json({
            error: "no name for the public key has been provided",
            expected_url,
        });
    }

    const version = req.query.version;
    if (!version) {
        return res.status(500).json({
            error: "no version has been provided",
            expected_url,
        });
    }

    const result = await getPublicKey(name, version);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function setPublicKeyController(
    req,
    res,
    next
) {
    expected_url = "/publickey?name={name}&public_key={public_key}";

    const from = getFrom(req);
    if (typeof from === undefined || !from) {
        return res.status(500).json({
            error: "`from` header is not properly set",
            expected_header: '{ "from": "owner|providerA|providerB|providerC|analyst|any" }',
        });
    }

    const name = req.query.name;
    if (!name) {
        return res.status(500).json({
            error: "no name for the public key has been provided",
            expected_url,
        });
    }

    const publicKey = req.query.public_key;
    if (!publicKey) {
        return res.status(500).json({
            error: "no public key has been provided",
            expected_url,
        });
    }

    const result = await setPublicKey(from, name, publicKey);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function resetPublicKeysController(
    req,
    res,
    next
) {
    const from = getFrom(req);
    if (typeof from === undefined || !from) {
        return res.status(500).json({
            error: "`from` header is not properly set",
            expected_header: '{ "from": "owner|providerA|providerB|providerC|analyst|any" }',
        });
    }

    const result = await resetPublicKeys(from);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

module.exports = { getPublicKeyController, setPublicKeyController, resetPublicKeysController }