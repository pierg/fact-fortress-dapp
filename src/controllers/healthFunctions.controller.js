const fs = require('fs');
const { resolve } = require('path');
const toml = require('toml');

// list of enabled health functions
const healthFunctions = ["risk", "simple", "variants"]

// Retrieve available functions endpoint
// (i.e. list of enabled health functions)
async function getAvailableFunctionsController(
    req,
    res,
    next
) {
    let availableHealthFunctions = {};

    for (const healthFunction of healthFunctions) {
        filePath = resolve(__dirname, `../../circuits/${healthFunction}/Prover.toml`);

        if (!fs.existsSync(filePath)) {
            console.log(`Error: skipping ${healthFunction} (${filePath} does not exist)`)
            continue;
        }

        const data = fs.readFileSync(filePath, 'utf8');

        availableHealthFunctions[healthFunction] = {
            "health_data": toml.parse(data)
        }
    }

    res.status(200).json(availableHealthFunctions);
}

module.exports = { getAvailableFunctionsController }