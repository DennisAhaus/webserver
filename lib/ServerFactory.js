const fs = require('fs');
const https = require('https')
const http = require('http');
const url = require('url');
const appFactory = require('./AppFactory');

const defaultLogger = {
    info() { }, warn() { }, debug() { }, error() { }
}

class ServerFactory {

    static createServer(server, logger = defaultLogger) {

        const port = server.port || 8080;
        const redirectTo = server.redirect || null;
        const proxyUrl = server.proxy || null;
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

        if (server.static != null || server.cors != null) {
            appFactory(server);
        }

        if (redirectTo != null) {

            requestListener = (req, res) => {
                const target = redirectTo.replace('{url}', req.url);
                logger.info(`${req.method} ${req.url}, redirect to '${target}'`);
                res.writeHead(301, { Location: target });
                res.on('error', (error) => {
                    logger.error(error, req);
                }).end();
            };

        } else if (proxyUrl != null) {

            requestListener = (req, res) => {
                const proxyTargetUrl = proxyUrl.replace('{url}', req.url);
                const proxyTargetUrlParsed = url.parse(proxyTargetUrl);

                logger.info(`${req.method} ${req.url}, proxy to ${proxyTargetUrl}`);


                let removeHeaders = [];
                if (server.headers && server.headers.remove) removeHeaders = server.headers.remove;


                if (proxyTargetUrlParsed.headers == null) proxyTargetUrlParsed.headers = {};
                Object.keys(req.headers).filter(key => !removeHeaders.includes(key))
                    .forEach((headerName) => {
                        proxyTargetUrlParsed.headers[headerName] = req.headers[headerName];
                    })

                let targetModule = proxyTargetUrl.startsWith('https') ? https : http;
                const targetProxy = targetModule.request(proxyTargetUrlParsed, function (proxyResponse) {
                    res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
                    proxyResponse.pipe(res, { end: true });
                });

                req.pipe(targetProxy, { end: true })
                    .on('error', (error) => {
                        logger.error(error);
                    });
            };

        } else {
            requestListener = app;
        }


        if (protocol === 'https') {
            return Object.assign(server, { server: https.createServer(options, requestListener) })
        } else {
            return Object.assign(server, { server: http.createServer(requestListener) })
        }

    }

}

module.exports = ServerFactory;
