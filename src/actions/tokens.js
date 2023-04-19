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

async function authorizeResearcher(from, recipient, accessTypes) {
    const sc = contractsHelper.getContractByName("ZkpHealthResearcherToken");

    try {
        const receipt = await sc.methods.authorizeResearcher(
            recipient,
            accessTypes
        ).send({ from, gas: '1000000' });
        const tokenId = receipt.events.Transfer.returnValues.tokenId;
        console.log(`researcher authorized: ${tokenId} (${accessTypes}) tx ${receipt.transactionHash}`);
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
            access_types: tokenId._accessTypes,
        };
    } catch (e) {
        console.error(e);
        return {
            error: "Address does not have a token",
        };
    }
}

async function getAllAccessTypes(address) {
    const sc = contractsHelper.getContractByName("ZkpHealthResearcherToken");

    try {
        const tokenId = await sc.methods.getAllAccessTypes().call();
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

async function getOwnAccessTypes(address) {
    const sc = contractsHelper.getContractByName("ZkpHealthResearcherToken");

    try {
        const tokenId = await sc.methods.getAllAccessTypes().call({ from: address });
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

module.exports = {
    authorizeAuthority,
    authorizeResearcher,
    getAuthorityTokenId,
    getResearcherTokenId,
    getAllAccessTypes,
    getOwnAccessTypes
};