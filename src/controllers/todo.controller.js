const { computeProof } = require("./../frontend_helpers/proof.js");
const { contracts } = require('../contracts/contracts.js');

// Retrieve available functions endpoint
async function getAvailableFunctionsController(
    req,
    res,
    next
) {
    // TODO

    // FAKE EXAMPLE
    const functions_json = {
        health_function: ["fun1", "fun2"],
        health_data: [
            "hospA_type_1",
            "hospA_type_2",
            "hospB_type_1",
            "hospB_type_2",
        ],
    };

    res.status(200).json(functions_json);
}

module.exports = { getAvailableFunctionsController }