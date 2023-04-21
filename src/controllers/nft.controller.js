const {
    authorizeAuthority,
    authorizeResearcher,
    getAuthorityTokenId,
    getResearcherTokenId,
    getAllAccessPolicies,
    getAccessPolicies
} = require("./../actions/tokens.js");
const { getFrom } = require("./common.controller.js");

async function authorizeAuthorityController(
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
            expected_header: '{ "from": "owner|hospitalA|hospitalB|hospitalC|researcher|any" }',
        });
    }

    const result = await authorizeAuthority(from, recipient);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function authorizeResearcherController(
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
            expected_header: '{ "from": "owner|hospitalA|hospitalB|hospitalC|researcher|any" }',
        });
    }

    const accessPolicies = req.body["access_policies"];
    if (!accessPolicies) {
        return res.status(500).json({
            error: "no access policies array has been provided in the body of the request",
        });
    }

    const result = await authorizeResearcher(from, recipient, accessPolicies);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function getAuthorityTokenIdController(
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

    const result = await getAuthorityTokenId(address);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function getResearcherTokenIdController(
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

    const result = await getResearcherTokenId(address);

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
    authorizeAuthorityController,
    authorizeResearcherController,
    getAuthorityTokenIdController,
    getResearcherTokenIdController,
    getAllAccessPoliciesController,
    getAccessPoliciesController
}