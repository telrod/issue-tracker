# Issue-Tracker

This project provides a REST API service for managing issues (e.g. support tickets).  

Although this project could be leveraged to build out a full-featured ticketing system, the primary intent of this project is to serve as a coding example.

Features:
* Create, read, update and delete (CRUD) issues
* Filtering for issues based on status and priority
* File attachments for issues
* Commenting on issues
* Optional user authentication and authorization

Missing Features (intentionally):
* Proper document storage.  Attachments are stored on local file system
* Proper authentication and authorization (i.e. OAuth)
* User assignment for issues
* Workflow for processing issues
* Notifications (e.g. email, sms)

See TODO section for items yet to be completed.


# Getting Started

This application was built using:
* nodejs/express
* mongodb
* mocha/chai
* swagger-jsdoc


## Dependencies
The following software is needed to run the application:

[mongodb](https://docs.mongodb.com/manual/installation/) >= v3.4.6

[node.js](https://nodejs.org/en/download/) >= v8.9.4

Note: The application _should_ work with older versions, but was developed and tested using the ones specified.

Tip: Although not required, use of a node version manager like [nvm](https://github.com/creationix/nvm) or [n](https://github.com/tj/n) is recommended as allows for easy installation and swapping out different versions of node.


## Installation

Clone the project from GitHub to local machine.

```
git clone git@github.com:telrod/issue-tracker.git
```

Install library dependancies.

```
npm install
```


## Running

To run the application, make sure mongodb is running and use:

```
npm start
```

This will start the app in develop mode, which will watch for code changes as they are made.

Then navigate in web browser to [http://localhost:3000/](http://localhost:3000/) where should get a response of
```
{"msg":"Welcome to Issue Tracker."}
```
to confirm is working correctly.


### Commands

The ```package.json``` file contains a number of scripts that can be run depending on need.  These scripts can be run using ```npm run [command]``` where the commands are:

* start - starts the application in develop mode and will watch for code changes
* test - runs all the tests under the root test directory
* build - uses [babel](https://babeljs.io/) to transpile ES6/ES7 code to ECMAScript 5 code within the ```dist``` directory
* serve - runs the application from the ```dist``` directory's transpiled code
* clean - deletes the transpiled code from the ```dist``` directory

The _clean_, _build_, and _serve_ commands should be used for production mode.


# Configuration

There are three _modes_ in which the app can run; **develop**, **test**, and **production**.  These modes loosely define the type of environment in which the code will be run.  Which mode to use is defined by the ```NODE_ENV``` environment property and is already set within the run command scripts.

The following configurations can be updated within the ```config.js``` file.

**Database** - Each of the modes utilize different mongodb databases; issue-tracker, issue-tracker-test, and issue-tracker-production.  By default, the configuration assumes mongodb is running locally and does not require a username/password.

```
mongodb: {
  host: 'localhost',
  database: 'example'
}
# or you can add an mongodb account for security
mongodb: {
  host: 'localhost',
  database: 'example',
  user:'user',
  password:'pwd'
}
```

**Upload Path** - The directory in which uploaded attachment files will be stored on the local filesystem.  The default directory is ```uploads``` off the root project directory.

**Port** - The default port for running the application is 3000.

**Logging** - The default log level is _trace_.

**Authorization** - By default, user login is NOT required for making API calls.  


# Testing

Tests utilize the [mocha](https://mochajs.org/) and [chai](http://chaijs.com/) frameworks.  All tests reside within the ```test``` directory.

To run all tests, use:

```
npm test
```


# Documentation

API documentation is provided via [swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc).

To view the API documentation, start the application and then navigate to [http://swagger.daguchuangyi.com/?url=http://localhost:3000/swagger.json#!](http://swagger.daguchuangyi.com/?url=http://localhost:3000/swagger.json#!)  


# TODO

* Issue comments
* Filtering for issues based on status and priority
* Finish CRUD (delete and update) for users
* Delete uploaded files on local filesystem after running attachment tests
