var express = require('express');
var exams = express.Router();
var db = require('../models');
var bols = require('../model_bols');

var listDeThi = [
    {
        maDe: 'HK2',
        numberQuestion: 3,
        time: 10,
        listQuestion: [
            {
                question: {
                    id: "question1",
                    text: "Số tròn chục liền sau số 30 là :"
                },
                type: "choose",
                answers: {
                    cauA: {
                        id: "q_1_0",
                        text: "50"
                    },
                    cauB: {
                        id: "q_1_1",
                        text: "40"
                    },
                    cauC: {
                        id: "q_1_2",
                        text: "20"
                    },
                    cauD: {
                        id: "q_1_3",
                        text: "10"
                    }
                },
                result: {
                    id: "q_1_2"
                }
            },
            {
                question: {
                    id: "question2",
                    text: "Số nào gồm 5 chục 8 đơn vị?"
                },
                type: "choose",
                answers: {
                    cauA: {
                        id: "q_2_0",
                        text: "85"
                    },
                    cauB: {
                        id: "q_2_1",
                        text: "58"
                    },
                    cauC: {
                        id: "q_2_2",
                        text: "805"
                    },
                    cauD: {
                        id: "q_2_3",
                        text: "508"
                    }
                },
                result: {
                    id: "q_2_3"
                }
            },
            {
                question: {
                    id: "question2",
                    text: "Bố đi công tác một tuần và 3 ngày. Hỏi bố đi công tác bao nhiêu ngày?"
                },
                type: "choose",
                answers: {
                    cauA: {
                        id: "q_3_0",
                        text: "7"
                    },
                    cauB: {
                        id: "q_3_1",
                        text: "10"
                    },
                    cauC: {
                        id: "q_3_2",
                        text: "3"
                    },
                    cauD: {
                        id: "q_3_3",
                        text: "5"
                    }
                },
                result: {
                    id: "q_3_1"
                }
            }
        ]
    }
];

/* GET home page. */
exams.get('/', function (req, res, next) {
    res.json(listDeThi);
});

exams.get('/:maDe', function (req, res, next) {
    var {maDe} = req.params;
    var result = {};
    for(var i = 0; i < listDeThi.length; i++) {
        if(listDeThi[i].maDe == maDe) {
            result = listDeThi[i];
            break;
        }
    }
    
    res.json(result);
});

exams.put('/', function (req, res, next) {
    var {objDeThi} = req.body;

    listDeThi.push(JSON.parse(objDeThi));

    res.send({status: 200, message: "Add success", data: objDeThi});
});

exams.delete('/:id', function (req, res, next) {

});

module.exports = exams;