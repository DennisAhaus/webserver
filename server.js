const config = require('config');
const cluster = require('cluster');
const port = config.get('server.port');
const numCPUs = require('os').cpus().length;

const app = require('./lib/app');

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });

} else {

    app.listen(port, () => {
        console.log(`Worker ${process.pid} listen on port ${port}`);
    });

    console.log(`Worker ${process.pid} started`);
}

