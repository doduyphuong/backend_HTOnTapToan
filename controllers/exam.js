var express = require('express');
var exam = express.Router();
var db = require('./../models');
var bols = require('./../model_bols');
var middleware = require('./../configs/middlewware');

/* GET list exams */
exam.get('/', async function(req, res, next) {
    var { page, page_size } = req.query;
    if (!page && !page_size) {
        page = 1;
        page_size = 10;
    }

    where = {};
    str_fields = '';

    var listDeThi = [];
    listDeThi = await bols.My_model.paging('', where, str_fields, page, page_size);

    res.json(listDeThi);
});

// Get exam by id
exam.get('/:examId', async function(req, res, next) {
    var { examId } = req.params;
    var result = {};
    result = await bols.My_model.find_first('Exams', { _id: examId });

    res.json(result);
});

// Create 1 exam
exam.post('/', middleware.mdw_auth, async function(req, res, next) {
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('time_test', 'Time test is required').notEmpty();
    req.checkBody('description', 'Description question is required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json(errors);
    } else {
        var { questions } = req.body;
        if (questions.length > 0) {
            let dataCreate = {
                name: req.body.name,
                time_test: req.body.time_test,
                number_question: questions.length,
                description: req.body.description,
            };

            var newItem = await bols.My_model.create(req, 'Exams', dataCreate);

            if (newItem.status == 200) {
                for (var i = 0; i < questions.length; i++) {
                    var data = {};
                    const question = questions[i];

                    if (questions[i].questionTypeId == 1) {
                        let choose = [];
                        let result = 1;
                        for (var j = 0; j < question.options.length; j++) {
                            if (question.options[j].isAnswer) {
                                result = j + 1;
                            }
                            choose.push({ id: j + 1, name: question.options[j].name });
                        }

                        data = {
                            choose,
                            result,
                            examId: newItem.data._id,
                            name: question.name,
                            type: parseInt(question.questionTypeId),
                        };
                    } else if (question.questionTypeId == 2) {
                        data = {
                            examId: newItem.data._id,
                            name: question.name,
                            type: parseInt(question.questionTypeId),
                            result: question.correctAnswer,
                        };
                    }

                    const newQuestion = await bols.My_model.create(req, 'Questions', data);
                    if (newQuestion.status != 200) {
                        console.log('Error question-' + i, newQuestion);
                    }
                }

                return res.status(200).send('Create Exam Success!!!');
            } else {
                return res.status(500).send('Create Exam Error...');
            }
        } else {
            return res.status(400).json({ message: 'List question not empty.', data: { questions } });
        }
    }
});

/*
listAnswer: [
    {
        idQuestion,
        idAnswer
    }
]
*/
exam.post('/mark-exam', middleware.mdw_auth, async function(req, res) {
    var { examId, listAnswer } = req.body;
    if (examId) {
        var checkExam = await bols.My_model.find_first('Exams', { _id: examId });
        if (checkExam) {
            var listQuestion = await bols.My_model.find_all('Quesitons', { examId });
            var result = [];
            result.push({
                examId: checkExam._id,
                time_test: checkExam.time_test,
            });

            var score = 0;
            for (var i = 0; i < listAnswer.length; i++) {
                var answer = listAnswer[i];
                var checkTrue = false;
                for (var j = 0; j < listQuestion.length; j++) {
                    var question = listQuestion[j];

                    if (answer.idQuestion == question._id) {
                        if (question.type == 1 && answer.idAnswer == question.result) {
                            score += 1;
                            result.push({
                                name: question.name,
                                idQuestion: answer.idQuestion,
                                options: question.choose,
                                idAnswer: answer.idAnswer,
                                result: true,
                            });
                            checkTrue = true;
                            break;
                        } else if (
                            question.type == 2 &&
                            answer.idAnswer.toLowerCase() == question.result.toLowerCase()
                        ) {
                            score += 1;
                            result.push({
                                name: question.name,
                                idQuestion: answer.idQuestion,
                                idAnswer: answer.idAnswer,
                                result: true,
                            });
                            checkTrue = true;
                            break;
                        }
                    }
                }

                if (!checkTrue) {
                    let data_tmp = {
                        name: question.name,
                        idQuestion: answer.idQuestion,
                        idAnswer: answer.idAnswer,
                        result: false,
                    };

                    if (question.type == 1) {
                        data_tmp['options'] = question.choose;
                    }

                    result.push(data_tmp);
                }
            }

            result[0].listQuestion = checkExam.number_question;
            result[0].listAnswer = listAnswer.length;
            result[0].score = score;

            let rank = {
                score,
                id_exam: checkExam._id,
                id_user: req.user._id
            };

            let newRank = await bols.My_model.create(req, 'Ranks', rank);
            return res.status(200).json(result);
        }
    }

    res.status(400).send('Bad Request.');
});

// Update 1 exam
exam.put('/:examId', middleware.mdw_auth, async function(req, res, next) {
    var { examId } = req.params;
    if (examId) {
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('time_test', 'Time test is required').notEmpty();
        req.checkBody('number_question', 'Number question is required').notEmpty();

        var errors = req.validationErrors();
        if (errors) {
            return res.json(errors);
        } else {
            let dataCreate = {
                name: req.body.name,
                time_test: req.body.time_test,
                number_question: req.body.number_question,
            };

            var updateItem = await bols.My_model.update(req, 'Exams', { _id: examId }, dataCreate, false);

            if (updateItem.status == 200) {
                return res.status(200).send({ message: 'Update exam success!!!', data: newItem.data });
            } else {
                return res.status(500).send({ message: 'Update exam Error...', data: newItem.data });
            }
        }
    }

    res.status(400).send('Error param id');
});

// Delete 1 exam
// exam.delete('/:examId', async function (req, res, next) {
//     var { examId } = req.params;
//     if (examId) {
//         var result = await bols.My_model.delete('Exams', { _id: examId });
//         res.json(result);
//     }

//     res.status(400).send('Error param id');
// });

module.exports = exam;
