const express = require('express');
const config = require('config');
const helmet = require('helmet');
const http = require('http');
const https = require('https');
const url = require('url');

const createErrorHandler = (server, app) => {
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(err.statusCode || 500)
            .json({
                error: {
                    message: err.message
                }
            });
    })
};

const createCorsSupport = (server, app) => {

    if (!server || !server.cors) return;

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

const createStatic = (server, app) => {
    if (!server || !server.static) return;

    server.static.forEach((root) => {
        console.log('Register static www root path "%s"', root);
        app.use(express.static(root, { dotfiles: 'ignore' }));
    })
}

const createRedirect = (server, app) => {
    if (!server || !server.redirect) return;


    [].concat(server.redirect).forEach((redirect) => {

        const redirectTo = redirect.target || redirect;
        const onUrl = redirect.url || '*';

        console.log(`Register redirect: '${onUrl}' -> '${redirectTo}'`);

        app.use(onUrl, (req, res) => {
            const target = redirectTo.replace('{url}', req.url);
            res.location(target);
            res.redirect(301, target);
        });

    })

};



const createProxy = (server, app) => {

    if (!server || !server.proxy) return;

    const proxyUrl = server.proxy || null;
    const protocol = server.protocol || 'http';

    console.log(`Register proxy: '${proxyUrl}'`);

    app.use((req, res, next) => {
        const proxyTargetUrl = proxyUrl.replace('{url}', req.url);
        const proxyTargetUrlParsed = url.parse(proxyTargetUrl);

        // console.log(`${req.method} ${req.url}, proxy to ${proxyTargetUrl}`);

        let removeHeaders = [];
        if (server.headers && server.headers.remove) removeHeaders = server.headers.remove;


        if (proxyTargetUrlParsed.headers == null) proxyTargetUrlParsed.headers = {};
        Object.keys(req.headers).filter(key => !removeHeaders.includes(key))
            .forEach((headerName) => {
                proxyTargetUrlParsed.headers[headerName] = req.headers[headerName];
            })

        if (server.headers && server.headers.replace) {
            Object.keys(server.headers.replace)
                .forEach((headerName) => {
                    console.log(`Replace header '${headerName}' with value '${server.headers.replace[headerName]}'`);
                    proxyTargetUrlParsed.headers[headerName] = server.headers.replace[headerName];
                })
        }


        let targetModule = proxyTargetUrl.startsWith('https') ? https : http;
        // console.log(proxyTargetUrlParsed);
        const targetProxy = targetModule.request(proxyTargetUrlParsed, function (proxyResponse) {
            res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
            proxyResponse.pipe(res, { end: true });
        });

        req.pipe(targetProxy, { end: true })
            .on('error', (error) => {
                next(error);
            });
    })
};


const createInterceptors = (server, app) => {
    if (!server || !server.interceptor) return;

    server.interceptor.forEach((interceptorCfg) => {
        const interceptorPath = process.cwd() + '/' + interceptorCfg.file;
        console.log(`Loading interceptor: '${interceptorPath}'`);
        const interceptor = require(interceptorPath);
        app.use(interceptorCfg.url || '*', interceptor);
    });
};

class AppFactory {

    static create(server) {
        const app = express();
        app.use(helmet());

        createInterceptors(server, app);
        createCorsSupport(server, app);
        createStatic(server, app);
        createRedirect(server, app);
        createProxy(server, app);
        createErrorHandler(server, app);

        return app;
    }
}

module.exports = AppFactory;