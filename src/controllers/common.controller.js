const { getAccountByName } = require("./../accounts.js");

function getFrom(req) {
    if (!req.headers["from"]) {
        return;
    }

    return getAccountByName(req.headers["from"]).address;
}

module.exports = { getFrom }