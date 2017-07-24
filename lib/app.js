const express = require('express');
const config = require('config');
const sendMailRouter = require('node-sendmail-express-router');

const app = express();

app.use(sendMailRouter);

const wwwRoots = config.get('statics');

wwwRoots.forEach((root) => {
    console.log('Register static %s', root);
    app.use(express.static(root, { dotfiles: 'ignore' }));
})

app.use((err, req, res, next) => {
    console.log('error: ', err);
    res
        .status(err.statusCode || 500)
        .json({
            error: {
                message: err.message,
                stacktrace: err.stack
            }
        });
})

module.exports = app;