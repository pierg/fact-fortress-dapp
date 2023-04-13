const ganache = require('ganache');

module.exports = {
    networks: {
        development: {
            provider: ganache.provider({
                quiet: true,
            }),
            host: "localhost",
            port: 8545,
            network_id: "*"
        },
    },
    compilers: {
        solc: {
            version: "native",
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