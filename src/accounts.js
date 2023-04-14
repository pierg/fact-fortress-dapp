const AccountsIds = {
    Owner: 0,
    HospitalA: 1,
    HospitalB: 2,
    HospitalC: 3,
    Researcher: 4,
    Verifier: 5
}

// Note: the ad hoc mnemonic has to be enabled when launching the Ganache server
const Accounts = {
    0: {
        "address": "0x31e90BAB6c00CF00075002360f2B0f2f6A29586D",
        "private_key": "0xc2c086783b6ca433d72b46966937eb8289ec22191815e23d7d93c823a3c0dbd7"
    },
    1: {
        "address": "0x98526c571e324028250B0f5f247Ca4F1b575fadB",
        "private_key": "0xbf7e183488531e2181032f9ae15fa00d1b7183cb84be2bc60d50fb870c2c8a62"
    },
    2: {
        "address": "0x99eBB39932f6F697194EA70115762d4c06D1A9c9",
        "private_key": "0xa007ef7f59777ad5988111fe6b9386a7b60921bcbeb80fbe090a60795fa85d3a"
    },
    3: {
        "address": "0xa8B7285dAF6873c2b361722cC1253622ca4c036a",
        "private_key": "0x772b419408f183239782970166382c79e2a4289a11eb189a266e86e5ad87ea0a"
    },
    4: {
        "address": "0xac46159C08f103f7fF87ED138CFf7e389aac0550",
        "private_key": "0x21c136d432cf0611d6b9d5dafdcb9a86231403e5efab85fba1bac87d86849269"
    },
    5: {
        "address": "0x5455280E6c20A01de3e846d683562AdeA6891026",
        "private_key": "0x8c0d02417be0e9d5757e1aca722ede60b245ada295593cb0161d4138c291dea9"
    },
}

function getValueByKey(key) {
    key = key.toLowerCase().trim();

    const keys = Object.keys(AccountsIds);

    for (const k of keys) {
        if (k.toLowerCase() === key) {
            return AccountsIds[k];
        }
    }

    return -1;
}

function getAddress(accountId) {
    let id;

    if (typeof accountId === 'string' || accountId instanceof String) {
        id = getValueByKey(accountId);

        if (typeof id == undefined || id == -1) {
            return;
        }
    } else {
        id = accountId;
    }

    return Accounts[id]["address"];
}

function getPrivateKey(accountId) {
    return Accounts[accountId]["private_key"];
}

module.exports = { AccountsIds, getAddress, getPrivateKey };