const Web3 = require('web3');
const server = require('./ganache.js');
const web3 = new Web3(server.provider);

// handleRevert required to return the call errors 
web3.eth.handleRevert = true;

module.exports = web3;