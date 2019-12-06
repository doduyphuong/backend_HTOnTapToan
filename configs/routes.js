var express = require('express');
var routes = express.Router();

var index = require('./../controllers/index');
routes.use('/', index);

var exams = require('../controllers/exams');
routes.use('/exams', exams);
// routes.use('/', exams);

//error
var handle_error = require('./../controllers/handle_error');
routes.use('/handle-error', handle_error);

module.exports = routes;