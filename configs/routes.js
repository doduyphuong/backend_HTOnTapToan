var express = require('express');
var routes = express.Router();

var index = require('./../controllers/index');
routes.use('/', index);

var exam = require('../controllers/exam');
routes.use('/exam', exam);

var user = require('../controllers/user');
routes.use('/user', user);

var rank = require('../controllers/rank');
routes.use('/rank', rank);

//error
var handle_error = require('./../controllers/handle_error');
routes.use('/handle-error', handle_error);

module.exports = routes;