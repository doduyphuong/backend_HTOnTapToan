var express = require('express');
var index = express.Router();
var db = require('./../models');
var bols = require('./../model_bols');


/* GET home page. */
index.get('/', function(req, res, next) {
  res.render('index', { title: "Adtima's CRM Platform" });
});


index.get('/messenger', function(req, res, next) {
  var data = null;
  res.render('messenger', data);
});


index.get('/chat', function(req, res, next) {
  
});


module.exports = index;