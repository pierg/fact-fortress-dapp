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


async function getAuthorityTokenId(address) {
    const sc = contractsHelper.getContractByName("ZkpHealthAuthorityToken");

    try {
        const tokenId = await sc.methods.userToToken(address).call();
        console.log(`Address ${address} has token #${tokenId}`);
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

async function getAllAccessTypes() {
    const sc = contractsHelper.getContractByName("ZkpHealthResearcherToken");

    try {
        const accessPolicies = await sc.methods.getAllAccessTypes().call();
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

async function getAccessTypes(address) {
    const sc = contractsHelper.getContractByName("ZkpHealthResearcherToken");

    try {
        const accessPolicies = await sc.methods.getAccessTypes(address).call();
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
    authorizeResearcher,
    getAuthorityTokenId,
    getResearcherTokenId,
    getAllAccessTypes,
    getAccessTypes
};