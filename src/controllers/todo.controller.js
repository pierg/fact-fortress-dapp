const { contractsHelper } = require('../contracts/contracts.js');

// Retrieve available functions endpoint
async function getAvailableFunctionsController(
    req,
    res,
    next
) {
    let availableHealthFunctions = {};

    for (const contractName in contractsHelper.contracts) {
        const sc = contractsHelper.contracts[contractName];

        if (sc.is_verifier) {
            // TODO: replace with more complete examples
            availableHealthFunctions[sc.circuit_purpose] = {
                "health_data": [
                    "hospA_type_1",
                    "hospA_type_2",
                    "hospB_type_1",
                    "hospB_type_2",
                ]
            }
        }

    };

    res.status(200).json(availableHealthFunctions);
}


module.exports = { getAvailableFunctionsController }