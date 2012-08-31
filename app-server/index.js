var config = require('./config.json'),
	express = require('express'),
	resource = require('express-resource'),
	fn = require('functions'),
	database = require('database'),
	User = require('User');

var finisher = function (req, res, next) {
		res.finish = function (err, data) {
			if (err) {
				res.send(err, HTTP.INTERNAL_SERVER_ERROR);
			} else if (data) {
				res.send(data);
			} else {
				res.send(HTTP.OK);
			}
		};
		next();
	},
	db = new database.Db({
		factory: require('mysql'),
		config: config.db
	}),
	app = module.exports = express.createServer();

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session(config.session));

app.use(express.static(__dirname + '/../app-client'));

app.all('/api/*', finisher, db.feeder(), User.access);

app.get('/api/account/activate', User.activate);
app.get('/api/account/login', User.login);
app.get('/api/account/logout', User.logout);
app.get('/api/account', User.get);

app.resource('api/usertypes', require('resources/usertypes'));
app.resource('api/users', require('resources/users'));

db.initialize(function (err) {
	if (err) {
		throw err;
	}
	
	app.listen(8888);
	console.log('App started. Listening on port 8888...');
});