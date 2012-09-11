var config = require('./config.json'),
	express = require('express'),
	expressResource = require('express-resource'),
	expressNamespace = require('express-namespace'),
	registerApi = require('./api');

var app = module.exports = express.createServer();

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session(config.session));

app.use(express.static(__dirname + '/../app-client'));

app.namespace('/api', function () {
	registerApi(app, function (err) {
		if (err) {
			throw err;
		}

		app.listen(8888);
		console.log('App started. Listening on port 8888...');
	});
});