const ganache = require('ganache');

module.exports = {
    networks: {
        development: {
            provider: ganache.provider({
                quiet: true,
                chain: {
                    hardfork: "grayGlacier", // to temporarily address the nonce issue during the tests
                }
            }),
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