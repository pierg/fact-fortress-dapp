const { contractsHelper } = require('../contracts/contracts.js');
const clc = require('cli-color');

async function authorizeProvider(from, recipient) {
    const sc = contractsHelper.getContractByName("DataProvidersNFTs");

    try {
        const receipt = await sc.methods.authorizeProvider(recipient).send({ from, gas: '1000000' });
        const tokenId = receipt.events.Transfer.returnValues.tokenId;
        console.log(`data provider authorized: ${tokenId} — tx ${receipt.transactionHash}`);
        return {
            recipient,
            token_id: tokenId,
        };
    } catch (e) {
        console.error(clc.red(e.reason));
        return {
            error: e
        };
    }
}

async function unauthorizeProvider(from, address) {
    const sc = contractsHelper.getContractByName("DataProvidersNFTs");

    try {
        await sc.methods.unauthorizeProvider(address).send({ from, gas: '1000000' });
        console.log(`[reset] Data provider ${address} has been unauthorized`);
        return {
            address,
            "unauthorized": true,
        };
    } catch (e) {
        console.error(clc.red(e));
        return {
            error: "Address does not have a token",
        };
    }
}

async function authorizeAnalyst(from, recipient, accessPolicies) {
    const sc = contractsHelper.getContractByName("DataAnalystsNFTs");

    try {
        const receipt = await sc.methods.authorizeAnalyst(
            recipient,
            accessPolicies
        ).send({ from, gas: '1000000' });
        const tokenId = receipt.events.Transfer.returnValues.tokenId;
        console.log(`data analyst authorized: ${tokenId} (${accessPolicies}) tx ${receipt.transactionHash}`);
        return {
            "address": recipient,
            token_id: tokenId,
        };
    } catch (e) {
        console.error(clc.red(e.reason));
        return {
            error: e
        };
    }
}

async function unauthorizeAnalyst(from, address) {
    const sc = contractsHelper.getContractByName("DataAnalystsNFTs");

    try {
        await sc.methods.unauthorizeAnalyst(address).send({ from, gas: '1000000' });
        console.log(`[reset] Data analyst ${address} has been unauthorized`);
        return {
            address,
            "unauthorized": true,
        };
    } catch (e) {
        console.error(clc.red(e));
        return {
            error: "Address does not have a token",
        };
    }
}


async function getProviderTokenId(address) {
    const sc = contractsHelper.getContractByName("DataProvidersNFTs");

    try {
        const tokenId = await sc.methods.userToToken(address).call();
        console.log(`Address ${address} has token #${tokenId}`);

        if (tokenId == 0) {
            return {
                error: "Address does not have a token",
            };
        }

        return {
            address,
            token_id: tokenId,
        };
    } catch (e) {
        console.error(e);
        return {
            error: "Address does not have a token",
        };
    }
}

async function getAnalystTokenId(address) {
    const sc = contractsHelper.getContractByName("DataAnalystsNFTs");

    try {
        const tokenId = await sc.methods.userToToken(address).call();
        console.log(`Address ${address} has token #${tokenId}`);

        if (tokenId.tokenId == 0) {
            return {
                error: "Address does not have a token",
            };
        }

        return {
            address,
            token_id: tokenId.tokenId,
            access_policies: tokenId.accessPolicies,
        };
    } catch (e) {
        console.error(e);
        return {
            error: "Address does not have a token",
        };
    }
}

async function getAllAccessPolicies() {
    const sc = contractsHelper.getContractByName("DataAnalystsNFTs");

    try {
        const accessPolicies = await sc.methods.getAllAccessPolicies().call();
        console.log(`All access policies: ${accessPolicies}`);
        return {
            "access_policies": accessPolicies,
        };
    } catch (e) {
        console.error(e);
        return {
            error: "Address does not have a token",
        };
    }
}

async function setAllAccessPolicies(from, accessPolicies) {
    const sc = contractsHelper.getContractByName("DataAnalystsNFTs");

    try {
        await sc.methods.setAllAccessPolicies(
            accessPolicies
        ).send({ from, gas: '1000000' });

        return {
            "access_policies_set": accessPolicies,
        };
    } catch (e) {
        console.error(clc.red(e.reason));
        return {
            error: e
        };
    }
}

async function removeAllAccessPolicies(from) {
    const sc = contractsHelper.getContractByName("DataAnalystsNFTs");

    try {
        await sc.methods.removeAllAccessPolicies().send({ from, gas: '1000000' });
        console.log(`[reset] All access policies have been removed`);
        return {
            "access_policies_resetted": true,
        };
    } catch (e) {
        console.error(e);
        return {
            error: e,
        };
    }
}

async function getAccessPolicies(address) {
    const sc = contractsHelper.getContractByName("DataAnalystsNFTs");

    try {
        const accessPolicies = await sc.methods.getAccessPolicies(address).call();
        console.log(`Address ${address} has access policies #${accessPolicies}`);
        return {
            address,
            "access_policies": accessPolicies,
        };
    } catch (e) {
        console.error(e);
        return {
            error: "Address does not have a token",
        };
    }
}



module.exports = {
    authorizeProvider,
    unauthorizeProvider,
    authorizeAnalyst,
    unauthorizeAnalyst,
    getProviderTokenId,
    getAnalystTokenId,
    getAllAccessPolicies,
    setAllAccessPolicies,
    removeAllAccessPolicies,
    getAccessPolicies
};