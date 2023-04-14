const Web3 = require('web3');
const server = require('./ganache.js');
const web3 = new Web3(server.provider);

module.exports = web3;