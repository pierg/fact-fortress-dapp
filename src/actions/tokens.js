const { contractsHelper } = require('../contracts/contracts.js');

async function authorizeAuthority(from, recipient) {
    const sc = contractsHelper.getContractByName("ZkpHealthAuthorityToken");

    try {
        const receipt = await sc.methods.authorizeAuthority(recipient).send({ from, gas: '1000000' });
        const tokenId = receipt.events.Transfer.returnValues.tokenId;
        console.log(`authority authorized: ${tokenId} — tx ${receipt.transactionHash}`);
        return {
            recipient,
            token_id: tokenId,
        };
    } catch (e) {
        console.error(e.reason);
        return {
            error: e
        };
    }
}

async function unauthorizeAuthority(from, address) {
    const sc = contractsHelper.getContractByName("ZkpHealthAuthorityToken");

    try {
        await sc.methods.unauthorizeAuthority(address).send({ from, gas: '1000000' });
        console.log(`[reset] Authority ${address} has been unauthorized`);
        return {
            address,
            "unauthorized": true,
        };
    } catch (e) {
        console.error(e);
        return {
            error: "Address does not have a token",
        };
    }
}

async function authorizeResearcher(from, recipient, accessPolicies) {
    const sc = contractsHelper.getContractByName("ZkpHealthResearcherToken");

    try {
        const receipt = await sc.methods.authorizeResearcher(
            recipient,
            accessPolicies
        ).send({ from, gas: '1000000' });
        const tokenId = receipt.events.Transfer.returnValues.tokenId;
        console.log(`researcher authorized: ${tokenId} (${accessPolicies}) tx ${receipt.transactionHash}`);
        return {
            recipient,
            token_id: tokenId,
        };
    } catch (e) {
        console.error(e.reason);
        return {
            error: e
        };
    }
}

async function unauthorizeResearcher(from, address) {
    const sc = contractsHelper.getContractByName("ZkpHealthResearcherToken");

    try {
        await sc.methods.unauthorizeResearcher(address).send({ from, gas: '1000000' });
        console.log(`[reset] Researcher ${address} has been unauthorized`);
        return {
            address,
            "unauthorized": true,
        };
    } catch (e) {
        console.error(e);
        return {
            error: "Address does not have a token",
        };
    }
}


async function getAuthorityTokenId(address) {
    const sc = contractsHelper.getContractByName("ZkpHealthAuthorityToken");

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

async function getResearcherTokenId(address) {
    const sc = contractsHelper.getContractByName("ZkpHealthResearcherToken");

    try {
        const tokenId = await sc.methods.userToToken(address).call();
        console.log(`Address ${address} has token #${tokenId}`);

        if (tokenId._tokenId == 0) {
            return {
                error: "Address does not have a token",
            };
        }

        return {
            address,
            token_id: tokenId._tokenId,
            access_policies: tokenId._accessPolicies,
        };
    } catch (e) {
        console.error(e);
        return {
            error: "Address does not have a token",
        };
    }
}

async function getAllAccessPolicies() {
    const sc = contractsHelper.getContractByName("ZkpHealthResearcherToken");

    try {
        const accessPolicies = await sc.methods.getAllAccessPolicies().call();
        console.log(`All access policies: ${accessPolicies}`);
        return {
            accessPolicies,
        };
    } catch (e) {
        console.error(e);
        return {
            error: "Address does not have a token",
        };
    }
}

async function removeAllAccessPolicies(from) {
    const sc = contractsHelper.getContractByName("ZkpHealthResearcherToken");

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
    const sc = contractsHelper.getContractByName("ZkpHealthResearcherToken");

    try {
        const accessPolicies = await sc.methods.getAccessPolicies(address).call();
        console.log(`Address ${address} has access policies #${accessPolicies}`);
        return {
            address,
            accessPolicies,
        };
    } catch (e) {
        console.error(e);
        return {
            error: "Address does not have a token",
        };
    }
}



module.exports = {
    authorizeAuthority,
    unauthorizeAuthority,
    authorizeResearcher,
    unauthorizeResearcher,
    getAuthorityTokenId,
    getResearcherTokenId,
    getAllAccessPolicies,
    removeAllAccessPolicies,
    getAccessPolicies
};