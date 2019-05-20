const supertest = require('supertest');
const AppFactory = require('../../index');

const app1 = AppFactory.create({
    "protocol": "http",
    "port": 8090,
    "static": [
        "test/resources/public1",
    ]
});
const app2 = AppFactory.create({
    "protocol": "https",
    "port": 8091,
    "cert": "./test/resources/cert.pem",
    "key": "./test/resources/key.pem",
    "passphrase": "1234",
    "proxy": "http://localhost:8090{url}",
    "headers": {
        "remove": [
            "Host",
            "host"
        ],
        "replace": {
            "host": "anyUrl.com",
            "Host": "anyUrl.com"
        }
    }
});
const fs = require('fs');
const htmlData1 = '' + fs.readFileSync(__dirname + '/../resources/public1/index.html');

const client = supertest(app2);

describe(__filename, () => {

    let server1;
    before((done) => {
        server1 = app1.listen(8090, done);
    })

    after((done) => {
        server1.close(done);
    })

    describe('Test proxy server', () => {
        describe('GET /', () => {

            it('should get first static website via proxy', done => {
                client
                    .get('/index.html')
                    .expect(200, htmlData1)
                    .end(done);
            });

        });
    });
});