const Docker = require('dockerode');

// Connect to the local Docker engine via the default socket
const docker = new Docker();

module.exports = docker; 