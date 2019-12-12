var express = require('express');
var rank = express.Router();
var db = require('../models');
var bols = require('../model_bols');

/* GET list rank */
rank.get('/', async function (req, res, next) {
    var { page, page_size } = req.query;
    if (!page && !page_size) {
        page = 1;
        page_size = 10;
    };

    where = {};
    str_fields = '';

    var listRank = [];
    listRank = await bols.My_model.paging('Ranks', where, str_fields, page, page_size);

    res.json(listRank);
});

// Get rank by rankId
rank.get('/:rankId', async function (req, res, next) {
    var { rankId } = req.params;
    var result = {};
    result = await bols.My_model.find_first('Ranks', { _id: rankId });

    res.json(result);
});

// Get rank by userId
rank.get('/user-rank/:userId', async function (req, res, next) {
    var { userId } = req.params;
    var result = {};
    result = await bols.My_model.find_first('Ranks', { id_user: userId });

    res.json(result);
});

// Create 1 rank
rank.post('/', async function (req, res, next) {
    req.checkBody('id_exam', 'Id exam is required').notEmpty();
    req.checkBody('id_user', 'Id user question is required').notEmpty();
    req.checkBody('score', 'Score question is required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.json(errors);
    }
    else {
        let dataCreate = {
            id_exam: req.body.id_exam,
            id_user: req.body.id_user,
            score: req.body.score
        }

        var newItem = await bols.My_model.create(req, 'Ranks', dataCreate);

        if (newItem.status == 200) {
            return res.status(200).send({message: 'Create Rank Success!!!', data: newItem.data});
        }
        else {
            return res.status(500).send({message: 'Create Rank Error...', data: newItem.data});
        }
    }
});

// Update information user
rank.put('/:rankId', async function (req, res, next) {
    var { rankId } = req.params;
    if (rankId) {
        req.checkBody('score', 'Score is required').notEmpty();

        var errors = req.validationErrors();
        if (errors) {
            return res.json(errors);
        }
        else {
            let dataCreate = {
                score: req.body.score
            }

            var updateItem = await bols.My_model.update(req, 'Rank', { _id: rankId }, dataCreate, false);

            if (updateItem.status == 200) {
                return res.status(200).send({message: 'Update rank success!!!', data: newItem.data});
            }
            else {
                return res.status(500).send({message: 'Update rank Error...', data: newItem.data});
            }
        }
    }

    res.status(400).send('Bad request.');
});

// Delete 1 exam
rank.delete('/:rankId', async function (req, res, next) {
    var { rankId } = req.params;
    if (rankId) {
        var result = await bols.My_model.delete('Ranks', { _id: rankId });
        return res.status(200).json(result);
    }

    res.status(400).send('Bad request.');
});

module.exports = rank;