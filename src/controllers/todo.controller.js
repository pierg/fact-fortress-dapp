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

// Generate proof from functions endpoint
async function generateProofFunctionController(
    req,
    res,
    next
) {
    const health_function = req.query.health_function;
    const health_data = req.query.health_data;

    const sc = contracts.getContractByFunction(health_function);

    if (!sc) {
        res.status(404).json({ "error": `verifier ${health_function} not found` });
    }

    // TODO(Guillaume)
    // compute the proof with the relevant contract

    // const result = await computeProof(publicKey, hash, signature);

    // // FAKE EXAMPLE
    // const proof_return = {
    //     verifier_address: "0x5455280E6c20A01de3e846d683562AdeA6891026",
    //     proof:
    //         "02ce3c7d831f9bddcaf8e44b728514fb0787082535a5e9643a02b6d847c0525a02e5f7739ea14a51ae0a517e14d187008cc2c5bc72144d1a5e3c72f78e5d08910239a2d93e3b4b338f643e6fc6c721b3d20353eae43182e2ba44bf1c65c294cd15f9ae38956fce8bda9620ea8a982bd69c0638354843a208afd7a4a2f9eef83026b15b7047ab1bc92ff98d2943996f439cea1147b59e25e8be38f567ae4760610a7e6f1e2c244bab9cba5b7aeacf551eb5b1924c30687ef21f80649599a6a1bb196ba0bbdbedb2d02d6387e93558fc594076ab2b461918c998cc086f8f903758058a53f4d4ca6bb26f7c93a98eef8c9576994f6b9e5d070fc6ad9ef330f2ff8b0ef95f681d4940d96523d88837a31880e3ad4dcccdf4e83aa6b5e31f586f4a3b15ab970aa565161bb48edfd2d94f6accbd21ab9c9818dd41be495ba55fb86a322e42bc79153b9eb52f41e5543477952770aa1acb9276b5e8b91466b2a2f45a13158d84c8cda9fce5e7d5ea8fac8f4747beecd8e7f2371bd003c665454613d756002d426ed5a89e413dd8eea508012f30dfde00b457430e3c058cf608494dd6270e2eee4467fb566d972fbb10049dc481a9c00c9c7ba0ef520e1c0cfebfdbd377235a8a388af47838f12f572d416a3236f4a9d03f4194c1cc2fc8231ae42bea7d1fba73175b8d919272b6d953df9560726ad90b76f6c327be80fdafc166a9666e17916e22defd992fbf6661d6ad1efb4c0ba353245fe94db2b21eaea51d9c8793093c53099a678ed76a3353c1b72b2c6747f1c779b902b8d22b88f61d35005f5b0f880636ef16f8a87e98bff9488fe2083431d9a51d971c8b2f6330279ee43cb114602ca19880fe2fe043b58e81b13d6caa1d8a19e0dcf736f92117d7b28888da1bb4b4f2709c22978a649d6fc4b27c210f3ad5fbf79b4230294beedf66968e3918cfa2c99c617e348241f83250e8872fce2a202efbeecd3adc7ac67af67ade201d9a1517b7c779616c85ba9c5f8e54bb1c82a125e914ca6ad4817b361dceec3f17a089b4fd0ee9907dfad7ea00e0dba9d99db0c2b74fd631e4444a05e037ebed2e5a495b0ad33e6560e9671bcdde1cd3e96a75a4ee2576960f30f0396c7221a8287bb230b0c8dab0ac3b8b688288edfa9d2aa2bf8a8c245f8b2a67fc7e7d32651a6106d0cc0f1199cad2b059430f264e02b7a84cdcfc28663bf3cde39a17827d2343a4c00949a9c0b92c7d3d19a6df371f4dba71dd914753e632cadf8ec1436b1b6925c7304436623e0eba7a8c80a80b831e9bf56bee26ce958be903b3986e74208e85d81f3f4ecf71b743e1fa3cc89a9fa83dea2c2c3079e1a252340e3d3b271ec1be07c1fc2bb431d515477344814a3d96536de7e442df7b5b8de8ebada15e0a9afbf7eca6746d59f2460982fe27cb5c52631a30d852d5034f2a4e85ddc9de17dc4b39bdc95d5451d800535d42a10808e45f05672c7fc4ef61204873a2e42215b0a95b0054d4c2f13ea5c015007863ef991e3674cf66f0bc8de3b2ba3de86a2affeebbe3b6f114c5bbe800fb45b8d294af8051e44da6df039b2ed077b323d0270a6d013949d781e3124f4e9d86abe040fde16e816c6e8edfb531a774e5b2092c144ad17686cd5565848b7b72a1509480b83ec0ec4589525b8be016b41e77b8",
    // };


    res.status(200).json(sc);
}


module.exports = { getAvailableFunctionsController, generateProofFunctionController }