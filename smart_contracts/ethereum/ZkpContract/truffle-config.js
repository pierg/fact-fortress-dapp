const ganache = require('ganache-cli');

module.exports = {
    networks: {
        development: {
            provider: ganache.provider(),
            host: "localhost",
            port: 8545,
            network_id: "*"
        },
    },
    compilers: {
        solc: {
            version: "^0.8.0",
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    before: (done) => {
        ganache.server().listen(8545, done);
    },
    after: (done) => {
        ganache.server().close(done);
    },
};