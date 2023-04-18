const { getAddress } = require("./accounts.js");
const {
  setPublicKey,
  getPublicKey,
  storeSignature,
} = require("./actions/publicInputs.js");
const { mint, getTokenId } = require("./actions/tokens.js");
const { contracts } = require("./contracts/contracts.js");
const { verifyPublicInputsPoP, verifyProofPoP } = require("./actions/proof.js");

// frontend helpers (would not be used in Production)
const {
  generateKeyPair,
  signMessage,
} = require("./frontend_helpers/keypair.js");
const { initHelpers, computeProof } = require("./frontend_helpers/proof.js");

const express = require("express");
const app = express();
app.use(express.json());

// server port
const port = 3000;

app.set("json spaces", 4);
// app.use(express.json())
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

function getFrom(req) {
  if (!req.headers["from"]) {
    return;
  }

  return getAddress(req.headers["from"]);
}

// Health endpoint
app.get("/health", (req, res) => {
  res.sendStatus(200);
});

// Mint endpoint
app.get("/mint", async (req, res) => {
  const recipient = req.query.recipient;
  if (!recipient) {
    return res.status(500).json({
      error: "no recipient has been provided",
      expected_url: "/mint?recipient={address}",
    });
  }

  const from = getFrom(req);
  if (typeof from === undefined || !from) {
    return res.status(500).json({
      error: "`from` header is not properly set",
      expected_header:
        '{ "from": "owner|hospitalA|hospitalB|hospitalC|researcher|any" }',
    });
  }

  const result = await mint(from, recipient);

  if (result.error) {
    res.status(500).json({
      error: result.error,
    });
  } else {
    res.status(200).json(result);
  }
});

// Get TokenID endpoint
app.get("/tokenid", async (req, res) => {
  const address = req.query.address;
  if (!address) {
    return res.status(500).json({
      error: "no address has been provided",
      expected_url: "/tokenid?address={address}",
    });
  }

  const result = await getTokenId(address);

  if (result.error) {
    res.status(500).json({
      error: result.error,
    });
  } else {
    res.status(200).json(result);
  }
});

// Get public key endpoint
app.get("/publickey", async (req, res) => {
  expected_url = "/publickey?name={name}&version={version}";

  const name = req.query.name;
  if (!name) {
    return res.status(500).json({
      error: "no name for the public key has been provided",
      expected_url,
    });
  }

  const version = req.query.version;
  if (!version) {
    return res.status(500).json({
      error: "no version has been provided",
      expected_url,
    });
  }

  const result = await getPublicKey(name, version);

  if (result.error) {
    res.status(500).json({
      error: result.error,
    });
  } else {
    res.status(200).json(result);
  }
});

// Set public key endpoint
app.put("/publickey", async (req, res) => {
  expected_url = "/publickey?name={name}&public_key={public_key}";

  const from = getFrom(req);
  if (typeof from === undefined || !from) {
    return res.status(500).json({
      error: "`from` header is not properly set",
      expected_header:
        '{ "from": "owner|hospitalA|hospitalB|hospitalC|researcher|any" }',
    });
  }

  const name = req.query.name;
  if (!name) {
    return res.status(500).json({
      error: "no name for the public key has been provided",
      expected_url,
    });
  }

  const publicKey = req.query.public_key;
  if (!publicKey) {
    return res.status(500).json({
      error: "no public key has been provided",
      expected_url,
    });
  }

  const result = await setPublicKey(from, name, publicKey);

  if (result.error) {
    res.status(500).json({
      error: result.error,
    });
  } else {
    res.status(200).json(result);
  }
});

// Store signature endpoint
app.post("/signature", async (req, res) => {
  const from = getFrom(req);
  if (typeof from === undefined || !from) {
    return res.status(500).json({
      error: "`from` header is not properly set",
      expected_header: '{ "from": "hospitalA|hospitalB|hospitalC" }',
    });
  }

  const publicKey = req.query.public_key;
  if (!publicKey) {
    return res.status(500).json({
      error: "no public key has been provided",
      expected_url: "/signature?public_key={public_key}",
    });
  }

  const signature = req.body["signature"];
  if (!signature) {
    return res.status(500).json({
      error: "no signature has been provided in the body of the request",
    });
  }

  const result = await storeSignature(from, publicKey, signature);

  if (result.error) {
    res.status(500).json({
      error: result.error,
    });
  } else {
    res.status(200).json(result);
  }
});

async function deploy() {
  await contracts.add("zkpToken.sol", "ZkpToken");
  await contracts.add("zkpVerifier.sol", "ZkpVerifier");
  await contracts.add("zkpContract.sol", "ZkpContract", [
    contracts.getAddress("ZkpToken"),
    contracts.getAddress("ZkpVerifier"),
  ]);
}

// Generate keypair endpoint
app.get("/key_pair", async (req, res) => {
  const result = await generateKeyPair();

  if (result.error) {
    res.status(500).json({
      error: result.error,
    });
  } else {
    res.status(200).json(result);
  }
});

// Retrieve available functions endpoint
app.get("/available_functions", async (req, res) => {
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
});

// Generate proof from functions endpoint
app.post("/generate_proof_function", async (req, res) => {
  const health_function = req.query.health_function;
  const health_data = req.query.health_data;

  // TODO

  const result = await computeProof(publicKey, hash, signature);

  // FAKE EXAMPLE
  const proof_return = {
    verifier_address: "0x5455280E6c20A01de3e846d683562AdeA6891026",
    proof:
      "02ce3c7d831f9bddcaf8e44b728514fb0787082535a5e9643a02b6d847c0525a02e5f7739ea14a51ae0a517e14d187008cc2c5bc72144d1a5e3c72f78e5d08910239a2d93e3b4b338f643e6fc6c721b3d20353eae43182e2ba44bf1c65c294cd15f9ae38956fce8bda9620ea8a982bd69c0638354843a208afd7a4a2f9eef83026b15b7047ab1bc92ff98d2943996f439cea1147b59e25e8be38f567ae4760610a7e6f1e2c244bab9cba5b7aeacf551eb5b1924c30687ef21f80649599a6a1bb196ba0bbdbedb2d02d6387e93558fc594076ab2b461918c998cc086f8f903758058a53f4d4ca6bb26f7c93a98eef8c9576994f6b9e5d070fc6ad9ef330f2ff8b0ef95f681d4940d96523d88837a31880e3ad4dcccdf4e83aa6b5e31f586f4a3b15ab970aa565161bb48edfd2d94f6accbd21ab9c9818dd41be495ba55fb86a322e42bc79153b9eb52f41e5543477952770aa1acb9276b5e8b91466b2a2f45a13158d84c8cda9fce5e7d5ea8fac8f4747beecd8e7f2371bd003c665454613d756002d426ed5a89e413dd8eea508012f30dfde00b457430e3c058cf608494dd6270e2eee4467fb566d972fbb10049dc481a9c00c9c7ba0ef520e1c0cfebfdbd377235a8a388af47838f12f572d416a3236f4a9d03f4194c1cc2fc8231ae42bea7d1fba73175b8d919272b6d953df9560726ad90b76f6c327be80fdafc166a9666e17916e22defd992fbf6661d6ad1efb4c0ba353245fe94db2b21eaea51d9c8793093c53099a678ed76a3353c1b72b2c6747f1c779b902b8d22b88f61d35005f5b0f880636ef16f8a87e98bff9488fe2083431d9a51d971c8b2f6330279ee43cb114602ca19880fe2fe043b58e81b13d6caa1d8a19e0dcf736f92117d7b28888da1bb4b4f2709c22978a649d6fc4b27c210f3ad5fbf79b4230294beedf66968e3918cfa2c99c617e348241f83250e8872fce2a202efbeecd3adc7ac67af67ade201d9a1517b7c779616c85ba9c5f8e54bb1c82a125e914ca6ad4817b361dceec3f17a089b4fd0ee9907dfad7ea00e0dba9d99db0c2b74fd631e4444a05e037ebed2e5a495b0ad33e6560e9671bcdde1cd3e96a75a4ee2576960f30f0396c7221a8287bb230b0c8dab0ac3b8b688288edfa9d2aa2bf8a8c245f8b2a67fc7e7d32651a6106d0cc0f1199cad2b059430f264e02b7a84cdcfc28663bf3cde39a17827d2343a4c00949a9c0b92c7d3d19a6df371f4dba71dd914753e632cadf8ec1436b1b6925c7304436623e0eba7a8c80a80b831e9bf56bee26ce958be903b3986e74208e85d81f3f4ecf71b743e1fa3cc89a9fa83dea2c2c3079e1a252340e3d3b271ec1be07c1fc2bb431d515477344814a3d96536de7e442df7b5b8de8ebada15e0a9afbf7eca6746d59f2460982fe27cb5c52631a30d852d5034f2a4e85ddc9de17dc4b39bdc95d5451d800535d42a10808e45f05672c7fc4ef61204873a2e42215b0a95b0054d4c2f13ea5c015007863ef991e3674cf66f0bc8de3b2ba3de86a2affeebbe3b6f114c5bbe800fb45b8d294af8051e44da6df039b2ed077b323d0270a6d013949d781e3124f4e9d86abe040fde16e816c6e8edfb531a774e5b2092c144ad17686cd5565848b7b72a1509480b83ec0ec4589525b8be016b41e77b8",
  };

  res.status(200).json(proof_return);
});

// Generate proof endpoint
app.post("/generate_proof", async (req, res) => {
  const publicKey = req.query.public_key;
  if (!publicKey) {
    return res.status(500).json({
      error: "no public key has been provided",
      expected_url: "/generate_proof?public_key={public_key}",
    });
  }

  const hash = req.body["hash"];
  if (!hash) {
    return res.status(500).json({
      error: "no hash has been provided in the body of the request",
    });
  }

  const signature = req.body["signature"];
  if (!signature) {
    return res.status(500).json({
      error: "no signature has been provided in the body of the request",
    });
  }

  const result = await computeProof(publicKey, hash, signature);

  if (result == null) {
    res.status(500).json({
      error: "Barretenberg Module not initialized yet",
    });
  } else if (result.error) {
    res.status(500).json({
      error: result.error,
    });
  } else {
    res.status(200).json(result);
  }
});

// Generate proof endpoint
app.post("/generate_proof", async (req, res) => {
  const publicKey = req.query.public_key;
  if (!publicKey) {
    return res.status(500).json({
      error: "no public key has been provided",
      expected_url: "/generate_proof?public_key={public_key}",
    });
  }

  const hash = req.body["hash"];
  if (!hash) {
    return res.status(500).json({
      error: "no hash has been provided in the body of the request",
    });
  }

  const signature = req.body["signature"];
  if (!signature) {
    return res.status(500).json({
      error: "no signature has been provided in the body of the request",
    });
  }

  const result = await computeProof(publicKey, hash, signature);

  if (result == null) {
    res.status(500).json({
      error: "Barretenberg Module not initialized yet",
    });
  } else if (result.error) {
    res.status(500).json({
      error: result.error,
    });
  } else {
    res.status(200).json(result);
  }
});

// Sign message endpoint
app.post("/sign", async (req, res) => {
  const privateKey = req.body["private_key"];
  if (!privateKey) {
    return res.status(500).json({
      error: "no private key has been provided in the body of the request",
    });
  }

  // message to hash and sign (i.e., health data)
  const message = req.body["message"];
  if (!message) {
    return res.status(500).json({
      error: "no message has been provided in the body of the request",
    });
  }

  const result = await signMessage(privateKey, message);

  if (result.error) {
    res.status(500).json({
      error: result.error,
    });
  } else {
    res.status(200).json(result);
  }
});

// Verify public inputs endpoint
app.post("/verify_public_inputs", async (req, res) => {
  const publicKey = req.query.public_key;
  if (!publicKey) {
    return res.status(500).json({
      error: "no public key has been provided",
      expected_url: "/verify_public_inputs?public_key={public_key}",
    });
  }

  const proof = req.body;
  if (!proof) {
    return res.status(500).json({
      error: "no proof has been provided in the body of the request",
    });
  }

  const result = await verifyPublicInputsPoP(publicKey, proof);

  if (result.error) {
    res.status(500).json({
      error: result.error,
    });
  } else {
    res.status(200).json(result);
  }
});

// Verify proof endpoint
app.post("/verify_proof", async (req, res) => {
  const proof = req.body;
  if (!proof) {
    return res.status(500).json({
      error: "no proof has been provided in the body of the request",
    });
  }

  const result = await verifyProofPoP(proof);

  if (result.error) {
    res.status(500).json({
      error: result.error,
    });
  } else {
    res.status(200).json(result);
  }
});

async function deploy() {
  await contracts.add("zkpToken.sol", "ZkpToken");
  await contracts.add("zkpVerifier.sol", "ZkpVerifier");
  await contracts.add("zkpContract.sol", "ZkpContract", [
    contracts.getAddress("ZkpToken"),
    contracts.getAddress("ZkpVerifier"),
  ]);
}

// init compute proof helpers in the background (takes time)
(async () => {
  await initHelpers();
})();

deploy().then(() => {
  const server = app.listen(port, () =>
    console.log(`Server started on port ${port}`)
  );

  process.on("SIGTERM", shutDown);
  process.on("SIGINT", shutDown);

  let connections = [];

  server.on("connection", (connection) => {
    connections.push(connection);
    connection.on(
      "close",
      () => (connections = connections.filter((curr) => curr !== connection))
    );
  });

  function shutDown() {
    console.log("Received kill signal, shutting down gracefully");
    server.close(() => {
      console.log("Closed out remaining connections");
      process.exit(0);
    });

    setTimeout(() => {
      console.error(
        "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
    }, 10000);

    connections.forEach((curr) => curr.end());
    setTimeout(() => connections.forEach((curr) => curr.destroy()), 5000);
  }
});
