const supertest = require('supertest');
const sinon = require('sinon');
const assert = require('assert');
const app = require('../../index');
const fs = require('fs');
const htmlData = '' + fs.readFileSync(__dirname + '/../resources/public/index.html');

const client = supertest(app);

describe(__filename, () => {
    describe('Test server', () => {
        describe('GET /', () => {

            it('should get website html', done => {
                client
                    .get('/')
                    .expect(200, htmlData)
                    .end(done);
            });

        });
    });
});