const express = require('express');
const config = require('config');
const sendMailRouter = require('node-sendmail-express-router');

const app = express();

app.use(sendMailRouter);

const wwwRoots = config.get('statics');
wwwRoots.forEach((roots) => {
    app.use(express.static(roots, { dotfiles: 'ignore' }));
})

module.exports = app;