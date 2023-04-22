const fs = require("fs");
const { resolve } = require("path");

// list of enabled health functions
const healthFunctions = [
  "average_dot_products",
  "sum_of_squares",
  "weighted_average",
];

// Retrieve available functions endpoint
// (i.e. list of enabled health functions)
async function getAvailableFunctionsController(req, res, next) {
  let availableHealthFunctions = [];

  for (const healthFunction of healthFunctions) {
    filePath = resolve(__dirname, `../../circuits/${healthFunction}/Info.json`);

    if (!fs.existsSync(filePath)) {
      console.log(
        `Error: skipping ${healthFunction} (${filePath} does not exist)`
      );
      continue;
    }

    const data = fs.readFileSync(filePath, "utf8");

    availableHealthFunctions.push(JSON.parse(data));
  }

  res.status(200).json(availableHealthFunctions);
}

module.exports = { getAvailableFunctionsController };
