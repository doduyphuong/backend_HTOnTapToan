var express = require('express');
var index = express.Router();
var db = require('./../models');
var bols = require('./../model_bols');

/* GET home page. */
index.get('/', async function(req, res, next) {  
  res.send('Welcome Adtima');
});
module.exports = index;