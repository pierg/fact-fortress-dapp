const { AccountsIds, getAddress, getPrivateKey } = require('./../accounts.js');
const web3 = require('./../web3.js');

async function deploy(contract, arguments) {
    const owner = AccountsIds.Owner;
    const account = await getAddress(owner);

    await web3.eth.personal.unlockAccount(account, '');

    const bytecode = contract.evm.bytecode.object;
    const abi = contract.abi;

    const sc = new web3.eth.Contract(abi);

    let deployOpts = {
        data: bytecode,
        arguments
    }

    const deployTx = sc.deploy(deployOpts);

    const createTransaction = await web3.eth.accounts.signTransaction({
            data: deployTx.encodeABI(),
            gas: await deployTx.estimateGas() * 2,
        },
        getPrivateKey(owner)
    );

    const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
    return createReceipt.contractAddress;
}

module.exports = { deploy };