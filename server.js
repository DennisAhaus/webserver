const config = require('config');
const cluster = require('cluster');
const fs = require('fs');
const numCPUs = require('os').cpus().length;
const https = require('https')
const http = require('http');
const url = require('url');

const app = require('./lib/app');

let logging = false;
if (config.has('logging')) logging = config.get('logging');

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });

} else {

    const servers = [];

    console.log(`Starting Worker ${process.pid}...`);

    const createServer = (protocol) => {

        const port = config.has(`server.${protocol}.port`) ? config.get(`server.${protocol}.port`) : 8080;
        const redirectTo = config.has(`server.${protocol}.redirect`) ? config.get(`server.${protocol}.redirect`) : null
        const proxyUrl = config.has(`server.${protocol}.proxy`) ? config.get(`server.${protocol}.proxy`) : null;

        let requestListener = null;
        let options = null;

        if (protocol === 'https') {
            options = {
                cert: fs.readFileSync(config.get(`server.${protocol}.cert`)),
                key: fs.readFileSync(config.get(`server.${protocol}.key`)),
            };

            if (config.has(`server.${protocol}.passphrase`)) {
                options.passphrase = config.get(`server.${protocol}.passphrase`);
            }
        }

        if (redirectTo != null) {

            requestListener = (req, res) => {
                const target = redirectTo.replace('{url}', req.url);
                if (logging) console.log(`${req.method} ${req.url}, redirect to '${target}'`);
                res.writeHead(301, { Location: target });
                res.on('error', (error) => {
                    if (logging) console.error(error);
                }).end();
            };

        } else if (proxyUrl != null) {

            requestListener = (req, res) => {
                const proxyTargetUrl = proxyUrl.replace('{url}', req.url);
                const proxyTargetUrlParsed = url.parse(proxyTargetUrl);

                if (logging) console.log(`${req.method} ${req.url}, proxy to ${proxyTargetUrl}`);

                let targetModule = proxyTargetUrl.startsWith('https') ? https : http;

                let removeHeaders = [];
                if (config.has(`server.${protocol}.headers.remove`)) {
                    removeHeaders = config.get(`server.${protocol}.headers.remove`);
                }

                if (proxyTargetUrlParsed.headers == null) proxyTargetUrlParsed.headers = {};
                Object.keys(req.headers).filter(key => !removeHeaders.includes(key))
                    .forEach((headerName) => {
                        proxyTargetUrlParsed.headers[headerName] = req.headers[headerName];
                    })

                const targetProxy = targetModule.request(proxyTargetUrlParsed, function (proxyResponse) {
                    res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
                    proxyResponse.pipe(res, { end: true });
                });

                req.pipe(targetProxy, { end: true })
                    .on('error', (error) => {
                        if (logging) console.error(error);
                    });
            };

        } else {
            requestListener = app;
        }


        if (protocol === 'https') {
            servers.push({
                server: https.createServer(options, requestListener),
                port, protocol
            });
        } else {
            servers.push({
                server: http.createServer(requestListener),
                port, protocol
            });
        }

    }

    if (config.has('server.http')) createServer('http');
    if (config.has('server.https')) createServer('https');

    module.exports = servers.map((options) => {
        return options.server.listen(options.port, () => {
            console.log(`${options.protocol} server listen on port ${options.port}`);
        })
    })

}

