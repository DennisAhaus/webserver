# Config

Create file <node module project root>/config/default.json following the rules of `npm config` module.

```json
{
    "servers": [
        {
            "protocol": "http",
            "port": 8080,
            "redirect": "https://localhost:8081{url}",
            // Or
            "redirect": {
                "url": "/redirect",
                "target": "https://localhost:8081{url}"
            },
            "static": [
                "test/resources/public1",
                "test/resources/public2"
            ],
            "cors": {
                "allowed": {
                    "hosts": [
                        ".*127.0.0.1.*",
                        ".*localhost.*"
                    ]
                },
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*"
                }
            },
            "interceptor": [
                {
                    "url": "*",
                    "file": "interceptor.js"
                }
            ]
        },
        {
            "protocol": "https",
            "port": 8081,
            "cert": "./test/resources/cert.pem",
            "key": "./test/resources/key.pem",
            "passphrase": "1234",
            "proxy": "https://example.com{url}",
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
        }
    ]
}
```
# Usage

### Start the server
`node server.js`

### Config file
`config/default.json` is used as config file.

To change the config file set `NODE_APP_INSTANCE=<instance name>`
then config module will load `default-<instance name>.json`

### Interceptor
The interceptor file must look like this

```js
module.exports = (req, res, next) => {
    next();
}
```