var express = require('express');
var user = express.Router();
var db = require('../models');
var bols = require('../model_bols');
var middleware = require('./../configs/middlewware');
/* GET list users */
user.get('/', async function(req, res, next) {
    var { page, page_size } = req.query;
    if (!page && !page_size) {
        page = 1;
        page_size = 10;
    }

    where = {};
    str_fields = 'username name phone';

    var listUser = [];
    listUser = await bols.My_model.paging('Users', where, str_fields, page, page_size);

    res.json(listUser);
});

// Get user by id
user.get('/:userName', middleware.mdw_auth, async function(req, res, next) {
    var { userName } = req.params;
    if (userName) {
        var { user } = req;
        if (user.username == userName) {
            var result = {};
            result = await bols.My_model.find_first('Users', { username: userName }, 'username name phone');

            return res.json(result);
        } else {
            return res.status(401).json({ message: 'invalid user.' });
        }
    }

    res.status(400).json({ message: 'Bad request.' });
});

// Create 1 user
user.post('/', async function(req, res, next) {
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody(
        'password',
        'Password must be 8 characters or longer, at least 1 lowercase, at least 1 uppercase and at least 1 numeric',
    )
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/, 'i')
        .withMessage(
            'Password must be 8 characters or longer, at least 1 lowercase, at least 1 uppercase and at least 1 numeric',
        );
    req.checkBody('name', 'Name question is required').notEmpty();
    req.checkBody('phone', 'Phone question is required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json(errors);
    } else {
        let checkUserName = await bols.My_model.find_first('Users', { username: req.body.username });
        if (!checkUserName) {
            let dataCreate = {
                username: req.body.username,
                password: req.body.password + config.app.secretKey,
                name: req.body.name,
                phone: req.body.phone,
            };

            var newItem = await bols.My_model.create(req, 'Users', dataCreate);

            if (newItem.status == 200) {
                return res.status(200).send('Create user success!!!');
            } else {
                return res.status(500).send('Create user error...');
            }
        } else {
            let err = [
                {
                    "location": "body",
                    "param": "username",
                    "msg": "Username is exist.",
                    "value": req.body.username
                }
            ];
            return res.status(400).json(err);
        }
    }
});

// Update information user
user.put('/:userId', async function(req, res, next) {
    var { userId } = req.params;
    if (userId) {
        var { user } = req;
        if (user._id == userId) {
            req.checkBody('name', 'Name is required').notEmpty();
            req.checkBody('phone', 'Phone is required').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                return res.json(errors);
            } else {
                let dataCreate = {
                    name: req.body.username,
                    phone: req.body.password,
                    email: req.body.email ? req.body.email : '',
                    district: req.body.district ? req.body.district : '',
                };

                var updateItem = await bols.My_model.update(req, 'Users', { _id: userId }, dataCreate, false);

                if (updateItem.status == 200) {
                    return res.status(200).send({
                        message: 'Update infor user success!!!',
                        data: newItem.data,
                    });
                } else {
                    return res.status(500).send({
                        message: 'Update infor user error...',
                        data: newItem.data,
                    });
                }
            }
        } else {
            return res.status(401).json({ message: 'Invalid user.' });
        }
    }

    res.status(400).send('Bad request.');
});

// Update password
user.put('/reset_pass/:userId', async function(req, res, next) {
    var { userId } = req.params;
    if (userId) {
        var { user } = req;
        if (user._id == userId) {
            req.checkBody('password', 'Password is required').notEmpty();
            req.checkBody('re_password', 'Re password is required').notEmpty();
            req.checkBody('password', 'Password and Repassword do not match.').equals(req.body.re_password);

            var errors = req.validationErrors();
            if (errors) {
                return res.json(errors);
            } else {
                let password = req.body.password + config.app.secretKey;
                var updateItem = await bols.Manage_user.update_password(userId, password);

                if (updateItem.status == 200) {
                    return res.status(200).send('Create user success!!!');
                } else {
                    return res.status(500).send('Create user error...');
                }
            }
        } else {
            return res.status(401).json({ message: 'Invalid user.' });
        }
    }

    res.status(400).send('Bad request.');
});

// Delete 1 user
// user.delete('/:userId', async function (req, res, next) {
//     var { userId } = req.params;
//     if (userId) {
//         var result = await bols.My_model.delete('Users', { _id: userId });
//         return res.json(result);
//     }

//     res.status(400).send('Bad request.');
// });

module.exports = user;
