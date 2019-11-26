var express = require('express');
var routes = express.Router();

var index = require('./../controllers/index');
routes.use('/', index);

//error
var handle_error = require('./../controllers/handle_error');
routes.use('/handle-error', handle_error);

module.exports = routes;