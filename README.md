# Config

Create file <node module project root>/config/default.json following the rules of `npm config` module.

```json
{
    "static": [
        "test/resources/public1",
        "test/resources/public2"
    ],
    "server": {
        "http": {
            "port": 80,
            "httpRedirect": "https://localhost"
        },
        "https": {
            "options": {
                "cert": "./test/resources/cert.pem",
                "key": "./test/resources/key.pem",
                "passphrase": "1234"
            },
            "port": 443
        }
    },
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
    }
}
```

Start the server /server.js. The http instance will redirect to the https instance.
TO change the config file set 'NODE_APP_INSTANCE=<instance name>` then config module will load
`default-<instance name>.json`