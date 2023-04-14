const { compile } = require('./compile.js');
const { deploy } = require('./deploy.js');

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
}

module.exports = { Contracts }