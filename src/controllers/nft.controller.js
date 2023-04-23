const {
    authorizeProvider,
    authorizeAnalyzer,
    getProviderTokenId,
    getAnalyzerTokenId,
    getAllAccessPolicies,
    getAccessPolicies
} = require("./../actions/tokens.js");
const { getFrom } = require("./common.controller.js");

async function authorizeProviderController(
    req,
    res,
    next
) {
    const recipient = req.query.recipient;
    if (!recipient) {
        return res.status(500).json({
            error: "no recipient has been provided",
        });
    }

    const from = getFrom(req);
    if (typeof from === undefined || !from) {
        return res.status(500).json({
            error: "`from` header is not properly set",
            expected_header: '{ "from": "owner|providerA|providerB|providerC|analyzer|any" }',
        });
    }

    const result = await authorizeProvider(from, recipient);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function authorizeDataAnalyzerController(
    req,
    res,
    next
) {
    const recipient = req.query.recipient;
    if (!recipient) {
        return res.status(500).json({
            error: "no recipient has been provided",
        });
    }

    const from = getFrom(req);
    if (typeof from === undefined || !from) {
        return res.status(500).json({
            error: "`from` header is not properly set",
            expected_header: '{ "from": "owner|providerA|providerB|providerC|analyzer|any" }',
        });
    }

    const accessPolicies = req.body["access_policies"];
    if (!accessPolicies) {
        return res.status(500).json({
            error: "no access policies array has been provided in the body of the request",
        });
    }

    const result = await authorizeAnalyzer(from, recipient, accessPolicies);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function getProviderTokenIdController(
    req,
    res,
    next
) {
    const address = req.query.address;
    if (!address) {
        return res.status(500).json({
            error: "no address has been provided",
        });
    }

    const result = await getProviderTokenId(address);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function getAnalyzerTokenIdController(
    req,
    res,
    next
) {
    const address = req.query.address;
    if (!address) {
        return res.status(500).json({
            error: "no address has been provided",
        });
    }

    const result = await getAnalyzerTokenId(address);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function getAllAccessPoliciesController(
    req,
    res,
    next
) {
    const result = await getAllAccessPolicies();

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function getAccessPoliciesController(
    req,
    res,
    next
) {
    const address = req.query.address;
    if (!address) {
        return res.status(500).json({
            error: "no address has been provided",
        });
    }

    const result = await getAccessPolicies(address);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

module.exports = {
    authorizeProviderController,
    authorizeDataAnalyzerController,
    getProviderTokenIdController,
    getAnalyzerTokenIdController,
    getAllAccessPoliciesController,
    getAccessPoliciesController
}