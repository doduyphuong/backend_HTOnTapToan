var express = require('express');
var index = express.Router();


/* GET home page. */
index.get('/', function(req, res, next) {
  res.render('index', { contend: "Xin chao be" });
});


index.get('/messenger', function(req, res, next) {
  var data = null;
  res.render('messenger', data);
});


index.get('/chat', function(req, res, next) {
  
});


module.exports = index;