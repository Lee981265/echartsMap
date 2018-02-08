var _ = require("underscore");
var MockServer = require("mock-http-server");

// Credentials mocking server side sessions
var credentials = [];

var server = new MockServer({
    port: 4242
});

var specs = [
    {
        method: 'GET',
        path: '/service/v1/date',
        reply: {
            status: 200,
            headers: {
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify({
                success: true,
                message: new Date().toString()
            })
        }
    },
    {
        method: 'POST',
        path: '/register',
        reply: {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: function(req) {
                var q = req.query;
                var found = credentials.find(function(item) {
                    return item.username === q.username;
                });
                if (found === undefined) {
                    credentials.push({
                        username: q.username,
                        password: q.password
                    });
                    return JSON.stringify({
                        success: true,
                        message: "Registered successfully"
                    });
                } else {
                    return JSON.stringify({
                        success: false,
                        message: "Account is already registered"
                    });
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/login',
        reply: {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: function(req) {
                var q = req.query;
                var found = credentials.find(function(item) {
                    return item.username === q.username;
                });
                if (found === undefined) {
                    return JSON.stringify({
                        success: false,
                        message: "No such user named '" + q.username + "'"
                    });
                } else {
                    if (found.password === q.password) {
                        return JSON.stringify({
                            success: true,
                            message: "Logged in successfully",
                            token: found
                        });
                    } else {
                        return JSON.stringify({
                            success: false,
                            message: "Username or password is incorrect"
                        });
                    }
                }
            }
        }
    },
    {
        method: '*',
        path: '/test',
        reply: {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: function(req) {
                return JSON.stringify({
                    success: true,
                    message: 'OK test'
                });
            }
        }
    }
];

_.each(specs, function(spec) {
    server.on(spec);
});

server.start(function() {
    console.log("Mock server started on port 4242");
});