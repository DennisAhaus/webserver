const fs = require('fs');
const https = require('https')
const http = require('http');
const url = require('url');
const AppFactory = require('./AppFactory');

const defaultLogger = {
    info() { }, warn() { }, debug() { }, error() { }
}

class ServerFactory {

    static createServer(server, logger = defaultLogger) {

        const protocol = server.protocol || 'http';

        let requestListener = null;
        let options = null;

        if (protocol === 'https') {
            options = {
                cert: fs.readFileSync(server.cert),
                key: fs.readFileSync(server.key),
            };
            if (server.passphrase) options.passphrase = server.passphrase || null;
        }

        const app = AppFactory.create(server);

        if (protocol === 'https') {
            return Object.assign(server, { server: https.createServer(options, app) });
        } else {
            return Object.assign(server, { server: http.createServer(app) });
        }

    }

}

module.exports = ServerFactory;
