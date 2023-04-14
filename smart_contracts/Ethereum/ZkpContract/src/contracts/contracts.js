const { compile } = require('./compile.js');
const { deploy } = require('./deploy.js');
const web3 = require('./../web3.js');

class Contracts {
    constructor() {
        this.contracts = {};
    }

    async add(filename, name, args) {
        const sc = compile(filename, name);
        const address = await deploy(sc, args);

        console.log(`${name} deployed at address ${address}`);

        this.contracts[name] = {
            "address": address,
            "abi": sc.abi,
            "contract": new web3.eth.Contract(sc.abi, address)
        }
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

    getContract(name) {
        if (!this.ensureContract(name)) return;

        return this.contracts[name]["contract"];
    }
}

module.exports = { Contracts }