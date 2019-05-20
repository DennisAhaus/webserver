const supertest = require('supertest');
const AppFactory = require('../../index');

const app = AppFactory.create({
    "static": [
        "test/resources/public1",
        "test/resources/public2"
    ]
});
const fs = require('fs');
const htmlData1 = '' + fs.readFileSync(__dirname + '/../resources/public1/index.html');
const htmlData2 = '' + fs.readFileSync(__dirname + '/../resources/public2/index2.html');

const client = supertest(app);

describe(__filename, () => {
    describe('Test server', () => {
        describe('GET /', () => {

            it('should get first static website html', done => {
                client
                    .get('/')
                    .expect(200, htmlData1)
                    .end(done);
            });

            it('should get second static website html', done => {
                client
                    .get('/index2.html')
                    .expect(200, htmlData2)
                    .end(done);
            });

        });
    });
});