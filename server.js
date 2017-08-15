const config = require('config');
const cluster = require('cluster');
const fs = require('fs');
const numCPUs = require('os').cpus().length;
const https = require('https')
const http = require('http')

const app = require('./lib/app');
const httpPort = config.get('server.http.port');


if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
    
} else {
    
    console.log(`Starting Worker ${process.pid}...`);
    config.get('server.http.port');

    if (config.get('server.https') != null) {

        const options = {
            cert: fs.readFileSync(config.get('server.https.options.cert')),
            key: fs.readFileSync(config.get('server.https.options.key')),
        };

        if (config.has('server.https.options.passphrase')) {
            options.passphrase = config.get('server.https.options.passphrase');
        }

        if (config.has('server.http.httpRedirect')) {
            // set up a route to redirect http to https
            const redirectTo = config.get('server.http.httpRedirect');
            console.log(`HTTP server with redirection to '${redirectTo}' is started`);

            http.createServer((req, res) => {
                res.writeHead(302, { 'Location': redirectTo + req.url });
                res.end();
            }).listen(httpPort);
        }

        module.exports = https.createServer(options, app).listen(config.get('server.https.port'));

    } else {
        module.exports = http.createServer(app).listen(httpPort);
    }

}

