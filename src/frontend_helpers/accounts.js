const { AccountsTypes, getAccountsByType } = require("../accounts.js");
const {
    getAccessPolicies,
    unauthorizeProvider,
    unauthorizeAnalyst,
    removeAllAccessPolicies
} = require("../actions/tokens.js");
const { getFrom } = require("../controllers/common.controller.js");

function sanitize(accounts) {
    return accounts
        .map(obj => { return {...obj } }) // deep copy
        .map(obj => {
            delete obj["account_type"];
            delete obj["private_key"];
            return obj;
        });
}

async function getAccountsController(
    req,
    res,
    next
) {
    const type = req.query.account_type;
    if (!type) {
        return res.status(500).json({
            error: "no (account) type has been provided",
        });
    }

    const accountType = type
        .replace(/ /g, '')
        .toLowerCase();

    let accounts;

    if (accountType.includes("owner")) {
        accounts = sanitize(
            getAccountsByType(AccountsTypes.nft_contract_owner)
        );
    } else if (accountType.includes("provider")) {
        accounts = sanitize(
            getAccountsByType(AccountsTypes.data_provider)
        );
    } else if (accountType.includes("analyst")) {
        accounts = sanitize(getAccountsByType(AccountsTypes.data_analyst));

        // get access policies for each data analyst
        for (let i = 0; i < accounts.length; ++i) {
            const accessPolicies = await getAccessPolicies(accounts[i].address);
            Object.assign(accounts[i], { "access_policies ": accessPolicies.accessPolicies });
        }
    } else if (accountType.includes("verifier")) {
        accounts = sanitize(
            getAccountsByType(AccountsTypes.data_verifier)
        );
    } else {
        console.log(`Error: no account found with account type ${type}`)
    }

    if (accounts) {
        res.status(200).json(accounts);
    } else {
        res.status(404).json({
            error: `No account found with account type ${type}`
        });
    }
}

async function resetAccountsController(
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

    r = [];

    // reset authorities tokens
    for (const provider of getAccountsByType(AccountsTypes.data_provider)) {
        r.push(await unauthorizeProvider(from, provider.address));
    }

    // reset data analysts tokens
    for (const analyst of getAccountsByType(AccountsTypes.data_analyst)) {
        r.push(await unauthorizeAnalyst(from, analyst.address));
    }

    r.push(await removeAllAccessPolicies(from));

    res.status(200).json(r);
}

module.exports = { getAccountsController, resetAccountsController }