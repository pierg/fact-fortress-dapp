const { compile } = require('./compile.js');
const { deploy } = require('./deploy.js');
const web3 = require('./../web3.js');
const clc = require('cli-color');

class ContractsHelper {
    constructor() {
        this.contracts = {};
    }

    async add(contract) {
        const sc = compile(contract.filename, contract.name);
        const address = await deploy(sc, contract.args);

        console.log(`${contract.name} deployed at address ${address}`);

        this.contracts[contract.name] = contract;
        this.contracts[contract.name].address = address;
        this.contracts[contract.name].abi = sc.abi;
        this.contracts[contract.name].contract = new web3.eth.Contract(sc.abi, address);
    }

    ensureContract(name) {
        if (!this.contracts.hasOwnProperty(name)) {
            console.log(`contract ${name} not found`);
            return false;
        }

        return true;
    }

    getAbi(name) {
        if (!this.ensureContract(name)) return;

        return this.contracts[name]["abi"];
    }

    getAddress(name) {
        if (!this.ensureContract(name)) return;

        return this.contracts[name]["address"];
    }

    getContractByName(name) {
        if (!this.ensureContract(name)) return;

        return this.contracts[name]["contract"];
    }

    getContractByStatementFunction(circuitPurpose) {
        for (const contractName in this.contracts) {
            const sc = this.contracts[contractName];

            if (sc.circuit_purpose &&
                sc.circuit_purpose.localeCompare(circuitPurpose, undefined, { sensitivity: 'base' }) === 0) {

                return sc;
            }
        }
    }
}

let contractsHelper = new ContractsHelper;

module.exports = { contractsHelper }