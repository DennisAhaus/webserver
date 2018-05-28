const config = require('config');
const cluster = require('cluster');
const fs = require('fs');
const numCPUs = require('os').cpus().length;
const https = require('https')
const http = require('http');
const url = require('url');

const app = require('./lib/AppFactory');
const ServerFactory = require('./lib/ServerFactory');

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

    console.log(`Starting Worker ${process.pid}...`);

    config.get('servers')
        .map(server => ServerFactory.createServer(server))
        .map((options) => {
            return options.server.listen(options.port, () => {
                console.log(`${options.protocol} server listen on port ${options.port}`);
            })
        })

}

