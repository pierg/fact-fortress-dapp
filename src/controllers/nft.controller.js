const {
    authorizeProvider,
    authorizeAnalyst,
    getProviderTokenId,
    getAnalystTokenId,
    getAllAccessPolicies,
    getAccessPolicies,
    setAllAccessPolicies
} = require("./../actions/tokens.js");
const { getFrom } = require("./common.controller.js");

async function authorizeProviderController(
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

    const from = getFrom(req);
    if (typeof from === undefined || !from) {
        return res.status(500).json({
            error: "`from` header is not properly set",
            expected_header: '{ "from": "owner|providerA|providerB|providerC|analyst|any" }',
        });
    }

    const result = await authorizeProvider(from, address);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function authorizeDataAnalystController(
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

    const from = getFrom(req);
    if (typeof from === undefined || !from) {
        return res.status(500).json({
            error: "`from` header is not properly set",
            expected_header: '{ "from": "owner|providerA|providerB|providerC|analyst|any" }',
        });
    }

    const accessPolicies = req.body["access_policies"];
    if (!accessPolicies) {
        return res.status(500).json({
            error: "no access policies array has been provided in the body of the request",
        });
    }

    const result = await authorizeAnalyst(from, address, accessPolicies);

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

async function getAnalystTokenIdController(
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

    const result = await getAnalystTokenId(address);

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

async function setAllAccessPoliciesController(
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

    const accessPolicies = req.body["access_policies"];
    if (!accessPolicies) {
        return res.status(500).json({
            error: "no access policies array has been provided in the body of the request",
        });
    }

    const result = await setAllAccessPolicies(from, accessPolicies);

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
    authorizeDataAnalystController,
    getProviderTokenIdController,
    getAnalystTokenIdController,
    getAllAccessPoliciesController,
    setAllAccessPoliciesController,
    getAccessPoliciesController
}