// TODO (Guillaume): this is a simplified implementation of the accounts management
//                   just for demo purposes

const AccountsTypes = {
    nft_contract_owner: 0,
    data_provider: 1,
    data_analyst: 2,
    data_verifier: 3,
};

const AccountsIds = {
    Owner: 0,
    ProviderA: 1,
    ProviderB: 2,
    ProviderC: 3,
    AnalystA: 4,
    AnalystB: 5,
    Verifier: 6,
};

// Note: the ad hoc mnemonic has to be enabled when launching the Ganache server
const Accounts = [{
        account_name: "Owner",
        account_type: AccountsTypes.nft_contract_owner,
        account_id: AccountsIds.Owner,
        address: "0x31e90BAB6c00CF00075002360f2B0f2f6A29586D",
        private_key: "0xc2c086783b6ca433d72b46966937eb8289ec22191815e23d7d93c823a3c0dbd7",
    },
    {
        account_name: "Provider A",
        account_type: AccountsTypes.data_provider,
        account_id: AccountsIds.ProviderA,
        address: "0x98526c571e324028250B0f5f247Ca4F1b575fadB",
        private_key: "0xbf7e183488531e2181032f9ae15fa00d1b7183cb84be2bc60d50fb870c2c8a62",
    },
    {
        account_name: "Provider B",
        account_type: AccountsTypes.data_provider,
        account_id: AccountsIds.ProviderB,
        address: "0x99eBB39932f6F697194EA70115762d4c06D1A9c9",
        private_key: "0xa007ef7f59777ad5988111fe6b9386a7b60921bcbeb80fbe090a60795fa85d3a",
    },
    {
        account_name: "Provider C",
        account_type: AccountsTypes.data_provider,
        account_id: AccountsIds.ProviderC,
        address: "0xa8B7285dAF6873c2b361722cC1253622ca4c036a",
        private_key: "0x772b419408f183239782970166382c79e2a4289a11eb189a266e86e5ad87ea0a",
    },
    {
        account_name: "Analyst A",
        account_type: AccountsTypes.data_analyst,
        account_id: AccountsIds.AnalystA,
        address: "0xac46159C08f103f7fF87ED138CFf7e389aac0550",
        private_key: "0x21c136d432cf0611d6b9d5dafdcb9a86231403e5efab85fba1bac87d86849269",
    },
    {
        account_name: "Analyst B",
        account_type: AccountsTypes.data_analyst,
        account_id: AccountsIds.AnalystB,
        address: "0x5455280E6c20A01de3e846d683562AdeA6891026",
        private_key: "0x8c0d02417be0e9d5757e1aca722ede60b245ada295593cb0161d4138c291dea9",
    },
    {
        account_name: "Verifier",
        account_type: AccountsTypes.data_verifier,
        account_id: AccountsIds.Verifier,
        address: "0xC6E71Dd699095a0e778518b6F50ee0093d40325c",
        private_key: "0x5b77e3da6a6236e8330a866338684432b36940c36690d898b783fcd8b6af91a7",
    },
];

function getAccountByName(name) {
    const account = Accounts.filter(function(obj) {
        return (
            obj.account_name.replace(/ /g, "").toLowerCase() ==
            name.replace(/ /g, "").toLowerCase()
        );
    });

    if (account.length != 1) {
        console.log(`Accounts error: returned ${account} for account name ${name}`);
        return {};
    }

    return account[0];
}

function getPrivateKey(accountId) {
    const account = Accounts.filter(function(obj) {
        return obj.account_id === accountId;
    });

    if (account.length != 1) {
        console.log(
            `Accounts error: returned ${account} for account ID ${accountId}`
        );
        return {};
    }

    return account[0].private_key;
}

function getAccountsByType(accountType) {
    return Accounts.filter(function(obj) {
        return obj.account_type === accountType;
    });
}

module.exports = {
    AccountsIds,
    AccountsTypes,
    getAccountByName,
    getPrivateKey,
    getAccountsByType,
};