const ganache = require('ganache');

// Create a new Ganache server
const server = ganache.server({
    verbose: false,
    debug: false,
    quiet: true,
    // mnemonic is required to make it deterministic
    mnemonic: "hard degree special clarify patch shield loyal purse away neglect lens mouse",
});

// Start the server
server.listen(8545, () => {
    console.log('Ganache server started on port 8545');
});

// Export the server object as a module
module.exports = server;