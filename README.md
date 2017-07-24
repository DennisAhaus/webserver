# Config

Create file <node module project root>/config/default.json

```json
{
    "statics": ["/var/www/website"],
    "server": {
        "port": 80
    },
    "mail": {
        "transport": {
            "host": "smtp.anyServer.com",
            "port": 123,
            "secure": true,
            "auth": {
                "user": "user",
                "pass": "passwd"
            }
        }
    },
    "cors": {
        "allowedOrigins": "127.0.0.1"
    }
}
```

Start the server /server.js