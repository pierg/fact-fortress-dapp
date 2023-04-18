const { getAddress } = require("./../accounts.js");

function getFrom(req) {
    if (!req.headers["from"]) {
        return;
    }

    return getAddress(req.headers["from"]);
}

module.exports = { getFrom }
