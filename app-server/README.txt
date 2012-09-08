
* Install Node.js - http://nodejs.org/ .

* Install the following node modules using command `npm install $NAME`:

express
express-resource
mysql@2.0.0-alpha3
http-status
emailjs
always (optional)

* Ensure that NODE_PATH points to the folder where npm puts the installed modules.

* Fill the configuration file ./config.json with valid MySQL and SMTP authentication info.

* Run `node .` while in 'app-server' directory. Alternatively run `always ./index.js`
  to keep the server running and automatically reload it on main file changes.

* Edit local webserver configuration to create proxy localhost/piko/ <=> localhost:8888
  or just access the server directly at localhost:8888 (some features may be broken).

---

The API currently supports the following commands and resources.

* Commands:

GET account
GET account/activate?code=$CODE
GET account/login?username=$USERNAME&password=$PASSWORD
GET account/logout

* Resources:

users						(+ allows adressing by usernames as well as IDs)
users/applications	(+ supports pseudo-ID 'latest')
usertypes

Resources support some or all of the following actions:

GET		/entities				->  list all entities
GET		/entities/new			->  create new entity
POST		/entities				->  -^
GET		/entities/$ID			->  get specific entity
GET		/entities/$ID/edit	->  edit specific entity
PUT		/entities/$ID			->  -^
DELETE	/entities/$ID			->  delete specific entity

Resources can be nested (as denoted by the slash(es) in their name):

GET		/parents/$PARENT_ID/entities/$ID		-> get specific entity

---

Root user credentials:

username: root
password: nPpQuuQUQ9v8HrZ3Qt49

---

Example:

GET http://localhost/piko/api/account
->
403: Not signed in.

GET http://localhost/piko/api/account/login?username=guest&password=guest
->
200: Signed in.

GET http://localhost/piko/api/account
->
200: {"id":2,"username":"guest","name":"Guest","email":"","can":{"manageUsertypes":false,"viewUsers":false,"createUser":false,"editUser":false,"deleteUser":false}}

GET http://localhost/piko/api/users/guest/applications/latest
->
404: Not Found

GET http://localhost/piko/api/users/1
->
403: Insufficient permissions.
