var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var hbs = require("express-hbs");
var request = require("request").defaults({
    jar: true
});

var app = express();

// 配置静态文件路径
var staticPath = path.resolve(__dirname, "../static");
app.use(express.static(staticPath));

// 静态页面文件（使用模板引擎后取消）
// var templatesPath = path.resolve(__dirname, "../templates");
// app.use(express.static(templatesPath));

// 读取POST请求数据
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Cookie支持，用于获取请求中的cookie
app.use(cookieParser());

// 模板引用会话变量
app.use(function(req, res, next) {
    var sessionId = req.cookies.JSESSIONID;
    if (!isEmpty(sessionId) && "undefined" !== sessionId) {
        res.locals.session = sessionId;
    }
    res.locals.message = req.cookies.message;
    next();
    try {
        res.clearCookie("message");
    } catch (e) {
        // ignore, a hack to mimic flash variable
    }
});

// 使用html文件作为模板
app.set('view engine', 'html');
// 指定模板文件目录
app.set('views', path.join(__dirname, '../templates'));
// 配置处理引擎
app.engine('html', hbs.express4({
    // defaultLayout: __dirname + '/views/layouts/default.hbs',
    // partialsDir: __dirname + '/views/partials',
    // layoutsDir: __dirname + '/views/layouts'
}));

/*
app.use(function(req, res) {
    res.status(404).set('Content-Type', 'text/plain').end("Error 404: Resource not found");
});
*/

/*
app.use(function(req, res) {
    res.status(400).set('Content-Type', 'text/plain').end("Error 400: Bad request");
});
*/

// 路由
app.get('/', function(req, res) {
    res.render("index");
});

app.post('/register', function(req, res) {
    processAccount(req, res, register);
});

app.post('/login', function(req, res) {
    processAccount(req, res, login);
});

app.get('/logout', function(req, res) {
    proxy(req, res, function(req, res, data) {
        res.clearCookie("JSESSIONID");
        res.cookie("message", "Logged out");
        res.redirect("/");
    });
});

// 跨域代理
app.get('/service/v1/date', function(req, res) {
    proxy(req, res, function(req, res, data) {
        var json = JSON.parse(data);
        res.status(200).end(json.message);
    });
});

// 通用错误处理逻辑，需要根据实际应用修改
function defaultErrorHandler(req, res, status, message) {
    res.cookie("message", message);
    // 不能写成res.redirect(status, path)否则将无法重定向
    res.status(status);
    res.redirect("/");
}

// 跨域代理实现
function proxy(req, res, callback) {
    // 启动时输入命令：BACKEND=http://realip nodemon server.js
    var backend = process.env.BACKEND || "http://localhost:4242";
    if (req.method === 'GET') {
        request.get(backend + req.path).on("response", function(response) {
            var data = "";
            response.on("data", function(chunk) {
                data += chunk;
            });
            response.on("end", function() {
                callback(req, res, data);
            });
        }).on("error", function(err) {
            defaultErrorHandler(req, res, 503, "Service Temporarily Unavailable");
        });
    } else if (req.method === 'POST') {
        var formData = {};
        try {
            formData = JSON.parse(req.body);
        } catch (e) {
            formData = req.body;
        }
        request.post({
            url: backend + req.path,
            form: formData
        }, function(err, response, body) {
            if (err) {
                defaultErrorHandler(req, res, 503, "Network connection error");
            } else {
                if (response.statusCode !== 200) {
                    defaultErrorHandler(req, res, 503, body);
                } else {
                    callback(req, res, body);
                }
            }
        });
    } else {
        defaultErrorHandler(req, res, 405, "Method Not Allowed");
    }
}

function login(req, res) {
    proxy(req, res, function(req, res, data) {
        var json = JSON.parse(data);
        if (json.success) {
            // 获取服务端会话ID并保存到cookie中
            res.cookie("JSESSIONID", json.sessionId);
        }
        res.cookie("message", json.message);
        res.redirect("/");
    });
}

function register(req, res) {
    proxy(req, res, function(req, res, data) {
        var json = JSON.parse(data);
        res.cookie("message", json.message);
        res.redirect("/");
    });
}

function processAccount(req, res, callback) {
    var body = req.body;
    // 避免上传过大数据
    if (body.length > 1e6) {
        res.redirect('/');
    }
    if (isEmpty(body.username) || isEmpty(body.password)) {
        res.cookie("message", "Username or password is null");
        res.redirect("/");
    } else {
        callback(req, res);
    }
}

function trim(s) {
    return s.replace(/^\s+/, '').replace(/\s+$/, '');
}

function isEmpty(param) {
    return param === undefined || trim(param) === '';
}

app.listen(4040);