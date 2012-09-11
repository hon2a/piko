var config = require('./config.json'),
	util = require('util'),
	fn = require('functions'),
	HTTP = require('http-status'),
	database = require('database'),
	smtp = require('smtp'),
	User = require('User'),
	resources = require('./resources');

module.exports = function (api, callback) {
	
	var db = new database.Db({
		factory: require('mysql'),
		config: config.db
	});
	
	api.all('/*',
		finisher,
		configProvider,
		baseUrlProvider,
		db.feeder(),
		smtp(config.smtp),
		User.access
	);
	
	fn.each(resources, function (registerResource) {
		registerResource(api, config);
	});

	db.initialize(function (err) {
		callback(err);
	});
};

// middleware ******************************************************************
	
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
};

var configProvider = function (req, res, next) {
	req.appConfig = config;
	next();
};

var baseUrlProvider = function (req, res, next) {
	// FIXME: create real base URL from req.host and config
	req.baseUrl = util.format('%s://localhost/piko/api', req.protocol);
	next();
};