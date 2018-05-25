# Config

Create file <node module project root>/config/default.json following the rules of `npm config` module.

```json
{
    "server": {
        "http": {
            "port": 80,
            "redirect": "https://localhost{url}",
            "static": [
                "a/path/to/http/resources1",
                "a/path/to/http/resources2",
            ],
        },
        "https": {
            "cert": "./test/resources/cert.pem",
            "key": "./test/resources/key.pem",
            "passphrase": "1234",
            "port": 443,
            "proxy":"https://example.com{url}"
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

Start the server /server.js. To change the config file set `NODE_APP_INSTANCE=\<instance name\>`
then config module will load `default-<instance name>.json`