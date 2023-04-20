const { AccountsTypes, getAccountsByType } = require("../accounts.js");
const { getAccessTypes } = require("./../actions/tokens.js");

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
    } else if (accountType.includes("analyzer")) {
        accounts = sanitize(getAccountsByType(AccountsTypes.data_analyzer));

        // get access types for each data analyzer/researcher
        for (let i = 0; i < accounts.length; ++i) {
            const accessTypes = await getAccessTypes(accounts[i].address);
            Object.assign(accounts[i], { "access_types ": accessTypes.accessTypes });
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

module.exports = { getAccountsController }