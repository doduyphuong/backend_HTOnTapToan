var express = require('express');
var exam = express.Router();
var db = require('./../models');
var bols = require('./../model_bols');

/* GET list exams */
exam.get('/', async function (req, res, next) {
    var { page, page_size } = req.query;
    if (!page && !page_size) {
        page = 1;
        page_size = 10;
    };

    where = {};
    str_fields = '';

    var listDeThi = [];
    listDeThi = await bols.My_model.paging('', where, str_fields, page, page_size);

    res.json(listDeThi);
});

// Get exam by id
exam.get('/:maDe', async function (req, res, next) {
    var { maDe } = req.params;
    var result = {};
    result = await bols.My_model.find_first('Exams', { _id: maDe });

    res.json(result);
});

// Create 1 exam
exam.post('/', async function (req, res, next) {
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('time_test', 'Time test is required').notEmpty();
    req.checkBody('number_question', 'Number question is required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.json(errors);
    }
    else {
        let dataCreate = {
            name: req.body.name,
            time_test: req.body.time_test,
            number_question: req.body.number_question
        }

        var newItem = await bols.My_model.create(req, 'Exams', dataCreate);

        if (newItem.status == 200) {
            return res.status(200).send('Create Exam Success!!!');
        }
        else {
            return res.status(500).send('Create Exam Error...');
        }
    }
});

// Update 1 exam
exam.put('/:examId', async function (req, res, next) {
    var { examId } = req.params;
    if(examId) {
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('time_test', 'Time test is required').notEmpty();
        req.checkBody('number_question', 'Number question is required').notEmpty();
    
        var errors = req.validationErrors();
        if (errors) {
            return res.json(errors);
        }
        else {
            let dataCreate = {
                name: req.body.name,
                time_test: req.body.time_test,
                number_question: req.body.number_question
            }
    
            var updateItem = await bols.My_model.update(req, 'Exams', {_id: examId}, dataCreate, false);
    
            if (updateItem.status == 200) {
                return res.status(200).send({message: 'Update exam success!!!', data: newItem.data});
            }
            else {
                return res.status(500).send({message: 'Update exam Error...', data: newItem.data});
            }
        }

    }

    res.status(402).send('Error param id');
});

// Delete 1 exam
exam.delete('/:maDe', async function (req, res, next) {
    var { maDe } = req.params;
    if (maDe) {
        var result = await bols.My_model.delete('Exams', { _id: maDe });
        res.json(result);
    }

    res.status(402).send('Error param id');
});

module.exports = exam;