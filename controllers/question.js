var express = require('express');
var question = express.Router();
var db = require('./../models');
var bols = require('./../model_bols');
var middleware = require('./../configs/middlewware');


/* GET home page. */
// question.get('/', function(req, res, next) {
//   res.render('question', { contend: "Xin chao be" });
// });

question.get('/:examId', middleware.mdw_auth, function(req, res, next) {
  var { examId } = req.params;
    if (examId) {
        var checkExam = await bols.My_model.find_first('Exams', { _id: examId });
        if (checkExam) {
            var listQuestion = await bols.My_model.find_all('Quesitons', { examId });

            return res.status(200).json(listQuestion);
        }
    }

    res.status(400).send('Bad Request.');
});

module.exports = question;