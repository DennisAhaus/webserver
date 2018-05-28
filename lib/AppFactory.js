const express = require('express');
const config = require('config');
const helmet = require('helmet');

const createCorsSupport = (server, app) => {

    const allowedOrigins = server.cors.allowed.hosts;

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

        if (server.cors.headers) {
            const corsHeaders = server.cors.headers;
            Object.keys(corsHeaders).forEach((key) => {
                const value = corsHeaders[key];
                res.set(key, value);
            })
        }

        next(error);
    });
}

const createStatic = (staticFolders, app) => {
    staticFolders.forEach((root) => {
        console.log('Register static www root path "%s"', root);
        app.use(express.static(root, { dotfiles: 'ignore' }));
    })
}

module.exports = (server) => {

    const app = express();
    app.use(helmet());

    if (server && server.cors) {
        createCorsSupport(server, app);
    }
    if (server && server.static) {
        createStatic(server.static, app);
    }

    app.use((err, req, res, next) => {
        console.error(err);
        res.status(err.statusCode || 500)
            .json({
                error: {
                    message: err.message
                }
            });
    })

    return app;
};