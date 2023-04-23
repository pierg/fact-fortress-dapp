const fs = require("fs");
const { resolve } = require("path");

// list of enabled statement functions
const statementFunctions = [
    "average_dot_products",
    "sum_of_squares",
    "weighted_average",
];

// Retrieve available functions endpoint
// (i.e. list of enabled statement functions)
async function getAvailableFunctionsController(req, res, next) {
    let availableStatementFunctions = [];

    for (const statementFunction of statementFunctions) {
        filePath = resolve(__dirname, `../../circuits/${statementFunction}/Info.json`);

        if (!fs.existsSync(filePath)) {
            console.log(
                `Error: skipping ${statementFunction} (${filePath} does not exist)`
            );
            continue;
        }

        const data = fs.readFileSync(filePath, "utf8");

        availableStatementFunctions.push(JSON.parse(data));
    }

    res.status(200).json(availableStatementFunctions);
}

module.exports = { getAvailableFunctionsController };