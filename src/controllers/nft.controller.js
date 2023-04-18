const { mint, getTokenId } = require("./../actions/tokens.js");
const { getFrom } = require("./common.controller.js");

async function mintController(
    req,
    res,
    next
) {
    const recipient = req.query.recipient;
    if (!recipient) {
        return res.status(500).json({
            error: "no recipient has been provided",
            expected_url: "/mint?recipient={address}",
        });
    }

    const from = getFrom(req);
    if (typeof from === undefined || !from) {
        return res.status(500).json({
            error: "`from` header is not properly set",
            expected_header:
                '{ "from": "owner|hospitalA|hospitalB|hospitalC|researcher|any" }',
        });
    }

    const result = await mint(from, recipient);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

async function getTokenIdController(
    req,
    res,
    next
) {
    const address = req.query.address;
    if (!address) {
        return res.status(500).json({
            error: "no address has been provided",
            expected_url: "/tokenid?address={address}",
        });
    }

    const result = await getTokenId(address);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
}

module.exports = { mintController, getTokenIdController }