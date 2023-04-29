const { contractsHelper } = require('../contracts/contracts.js');
const clc = require('cli-color');

async function getData(from, dataId) {
    const sc = contractsHelper.getContractByName("FactFortress");

    try {
        const dataSource = await sc.methods.getDataSource(
            dataId,
        ).call({ from });

        return {
            "data_url": dataSource[0],
            "data_credentials": dataSource[1],
        };
    } catch (e) {
        console.error(clc.red(e.reason));
        return {
            error: e
        };
    }
}

async function setData(from, dataId, url, credentials, accessPolicies) {
    const sc = contractsHelper.getContractByName("FactFortress");

    try {
        await sc.methods.setDataSource(
            dataId,
            url,
            credentials,
            accessPolicies,
        ).send({ from, gas: '1000000' });

        return {
            "data_set": true
        };
    } catch (e) {
        console.error(clc.red(e.reason));
        return {
            error: e
        };
    }
}

module.exports = {
    getData,
    setData
};