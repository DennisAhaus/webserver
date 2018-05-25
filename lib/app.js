const express = require('express');
const config = require('config');
const helmet = require('helmet');

const app = express();
app.use(helmet());

if (config.has('cors')) {
    const allowedOrigins = config.get('cors.allowed.hosts');

    app.use((req, res, next) => {

        const origin = req.headers.origin;

        if (origin == null) {
            return next();
        }

        console.log(`Authorize CORS origin '%j'`, origin);

        const found = [].concat(allowedOrigins).find((allowedHostRegEx) => {
            return origin != null && origin.match(new RegExp(allowedHostRegEx)) != null
        });

        let error;
        if (found == null) {
            error = new Error('Unauthorized CORS request');
            error.statusCode = 401;
        }

        if (config.has('cors.headers')) {
            const corsHeaders = config.get('cors.headers');
            Object.keys(corsHeaders).forEach((key) => {
                const value = corsHeaders[key];
                res.set(key, value);
            })
        }

        next(error);
    });
}

const createStatic = (configString) => {
    const wwwRoots = config.get(configString);
    wwwRoots.forEach((root) => {
        console.log('Register static www root path "%s"', root);
        app.use(express.static(root, { dotfiles: 'ignore' }));
    })
}

if (config.has('server.http.static')) createStatic('server.http.static');
if (config.has('server.https.static')) createStatic('server.https.static');

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500)
        .json({
            error: {
                message: err.message
            }
        });
})

module.exports = app;