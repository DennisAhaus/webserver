const router = require('../index')
const express = require('express');

const app = express();
app.use(router);

module.exports = {
    app, router
};
