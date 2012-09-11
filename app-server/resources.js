var util = require('util'),
	fn = require('functions'),
	HTTP = require('http-status'),
	User = require('User'),
	resource = require('resource');

var dirBridge = function (api, resPath, fsPath, params, makeHandlers) {
	var parent = null,
		ret = null;
	params.forEach(function (param) {
		var child = api.resource(resPath, resource.create(new resource.DirectoryHandlers({
			id: 'dirBridgeDummy',
			path: fsPath
		})));
		resPath = ':' + param;
		fsPath += '/' + resPath;
		
		if (parent) {
			parent.add(child);
		}
		parent = child;
		ret = ret || parent;
	});
	
	parent.add(api.resource(resPath, makeHandlers(fsPath)));
	
	return ret;
};

var resources = module.exports = {
	
	account: function (api, config) {
		api.get('/account/activate', User.activate);
		api.get('/account/login', User.login);
		api.get('/account/logout', User.logout);
		api.get('/account', User.get);
	},
	
	usertypes: function (api, config) {
		var handlers = new resource.DbTableHandlers({
			id: 'usertype',
			table: 'usertypes',
			transform: User.transformPrivileges
		});
		api.resource('usertypes', resource.create(handlers, {
			authenticator: 'manageUsertypes',
			validator: {
				all: {
					privileges: 'int'
				},
				update: {
					id: 'id'
				}
			}
		}));
	},
	
	users: function (api, config) {
		var users = api.resource('users', resource.create(new resource.UsersTableHandlers({
			id: 'user',
			table: 'users',
			transform: User.transformPrivileges,
			view: 'v_users_extended'
		}), {
			authenticator: {
				index: 'viewUsers',
				create: false,	// anyone can create inactive accounts
				show: 'viewUsers',
				update: 'editUser',
				destroy: 'deleteUser'
			},
			validator: {
				all: {
					password: 'password',
					name: ['text', 5, 50],
					email: 'email',
					typeId: 'id'
				},
				create: {
					username: 'username'
				},
				update: {
					id: 'id'
				}
			}
		}));
		
		var restrictToOwner = function (req, res, next) {
			if (req.access && req.user && (req.access.id === req.user.id)) {
				next(null, false);
			} else {
				res.send('Access restricted to owner.', HTTP.FORBIDDEN);
			}
		};
		
		users.add(api.resource('applications', resource.create(new resource.ApplicationsTableHandlers({
			id: 'application',
			table: 'applications',
			parent: {
				field: 'userId',
				id: 'user'
			}
		}), {
			authenticator: {
				index: restrictToOwner,
				create: restrictToOwner,
				show: function (req, res, next) {
					if (req.access && !req.access.can.approveApplications) {
						restrictToOwner(req, res, next);
					} else {
						next(null, 'approveApplications');
					}
				},
				update: 'approveApplications',
				destroy: restrictToOwner
			},
			validator: {
				create: {
					school: ['text', 5, 50],
					grade: ['number', 6, 9]
				},
				update: {
					approved: ['bool', true]
				}
			}
		})));
		
		users.add(dirBridge(api, 'solutions', config.storage.path + 'solutions/:user',
				['year', 'series'], function (path) {
			return resource.create(new resource.FileStorageHandlers({
				id: 'solution',
				path: path
			}), {
				authenticator: restrictToOwner
			});			
		}));
	}
};