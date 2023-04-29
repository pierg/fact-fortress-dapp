const {
    getData,
    setData
} = require("./../actions/data.js");
const { getFrom } = require("./common.controller.js");

async function setDataController(
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

    const dataId = req.body["data_id"];
    if (!dataId) {
        return res.status(500).json({
            error: "no data ID has been provided in the body of the request",
        });
    }

    const dataUrl = req.body["data_url"];
    if (!dataUrl) {
        return res.status(500).json({
            error: "no URL to the data has been provided in the body of the request",
        });
    }

    const dataCredentials = req.body["data_credentials"];
    if (!dataCredentials) {
        return res.status(500).json({
            error: "no data credentials have been provided in the body of the request",
        });
    }

    const accessPolicies = req.body["access_policies"];
    if (!accessPolicies) {
        return res.status(500).json({
            error: "no access policies array has been provided in the body of the request",
        });
    }

    const result = await setData(from,
        dataId,
        dataUrl,
        dataCredentials,
        accessPolicies,
    );

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function getDataController(
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

    const dataId = req.query.data_id;
    if (!dataId) {
        return res.status(500).json({
            error: "no data ID has been provided",
        });
    }

    const result = await getData(from,
        dataId,
    );

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

module.exports = { getDataController, setDataController }