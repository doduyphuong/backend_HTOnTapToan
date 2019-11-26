var express = require('express');
var article_category = express.Router();
var db = require('../models');
var bols = require('../model_bols');


// /* GET home page. */
article_category.get('/', async function (req, res) {
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);

    var filter = {};
    filter = helpers.helper.bind_data_filter(req);

    var data = {
        start_page: 1,
        page_size: 10,
        model_name: 'Article_category',
        search_fields: 'oa_id oa_name',
        order: JSON.stringify({ createdAt: 'desc' }),
        filter: JSON.stringify(filter),
        is_action : 1,
        action_list : JSON.stringify([        
            { label : 'Edit', type : 'link_button', data : 'fw_admin_goto_edit', prop : ['_id'] },
            { label : 'Detail', type : 'link_button', data : 'fw_admin_goto_detail', prop : ['_id'] }
        ])
    };
    res.render('adminpanel/article_category/index', data);
});

//detail
article_category.get('/detail/:id', async function (req, res, next) {
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);

    var item = null;
    let id = req.params.id;

    if (id != undefined) {
        item = await bols.My_model.findById('Article_category', id);
        if (item == null) {
            helpers.helper.show_404(res);
        }
    }

    //quay về trang trước
    var returnUrl = req.query.returnUrl;
    if (!returnUrl) {
        returnUrl = '/adminpanel/' + res.locals.adminController;
    }

    var data = {
        item: item,
        out_fields: await bols.My_model.model_fields('Article_category'),
        returnUrl: helpers.admin_helper.get_returnUrl(req, res)
    };

    res.render('adminpanel/detail', data);
});

/*add*/
article_category.get('/add', async function (req, res) {
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.add);

    //data generate ra view
    var data = {
        status_list: helpers.helper.status_list(),
        scriptjs: ''
    };

    res.render('adminpanel/article_category/add', data);
});

article_category.post('/add', async function (req, res) {
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.add);

    var scriptjs = '';
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('image', 'Image is required').notEmpty();
    req.checkBody('status', 'Status is required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));
    }
    else {
        let dataCreate = {
            name: req.body.name,
            image: req.body.image,
            parent_id: req.body.parent_id,
            status: req.body.status
        }
        let newItem = await bols.My_model.create(req, 'Article_category', dataCreate);
        if (newItem.status == 200) {
            req.flash('message_success', 'Success');
            scriptjs = '<script>empty_all_fields();</script>';
        }
        else {
            req.flash('message_error', newItem.data);
        }
    }

    //data generate ra view
    var data = {
        status_list: helpers.helper.status_list(),
        req: req,
        scriptjs: scriptjs
    };
    res.render('adminpanel/article_category/add', data);
});

// Edit
article_category.get('/edit/:id', async function (req, res) {
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

    var item = null;
    let id = req.params.id;

    if (id != undefined) {
        item = await bols.My_model.findById('Article_category', id);
        if (item == null) {
            helpers.helper.show_404(res);
        }
    }

    //data generate ra view
    var data = {
        status_list: helpers.helper.status_list(),
        item: item,
        returnUrl: helpers.admin_helper.get_returnUrl(req, res)
    };

    res.render('adminpanel/article_category/edit', data);
});

article_category.post('/edit/:id', async function (req, res) {
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

    var item = null;
    let id = req.params.id;

    if (id != undefined) {
        item = await bols.My_model.findById('Article_category', id);
        console.log(item);
        if (item == null) {
            helpers.helper.show_404(res);
        }
        else {
            req.checkBody('name', 'name is required').notEmpty();
            req.checkBody('image', 'cost is required').notEmpty();
            req.checkBody('status', 'value is required').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                //console.log(errors);
                req.flash('message_error', helpers.helper.validator_error_message(errors));
            }
            else {
                let dataUpdate = {
                    name: req.body.name,
                    image: req.body.image,
                    parent_id: req.body.parent_id,
                    status: req.body.status,
                }

                let where = {
                    _id: id
                };

                let updateItem = await bols.My_model.update(req, 'Article_category', where, dataUpdate, false);
                if (updateItem.status == 200) {
                    req.flash('message_success', 'Success');
                    item = await bols.My_model.findById('Article_category', id);//load lại      
                }
                else {
                    req.flash('message_error', updateItem.data);
                }
            }
        }
    }

    //data generate ra view
    var data = {
        status_list: helpers.helper.status_list(),
        item: item,
        req: req,
        returnUrl: helpers.admin_helper.get_returnUrl(req, res)
    };

    res.render('adminpanel/article_category/edit', data);
});

article_category.all('/active_list_id', async function (req, res) {
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.change_status);

    req.checkBody('fw_cb_items', 'Have not any item valid').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));
    }
    else {
        var msg = '';
        var items = [];

        if (typeof (req.body.fw_cb_items) == 'string') {
            items.push(req.body.fw_cb_items);
        }
        else {
            items = req.body.fw_cb_items;
        }

        for (var i = 0; i < items.length; i++) {
            let where = {
                '_id': items[i]
            };

            let data = {
                status: 1
            };

            let update = await bols.My_model.update(req, 'Article_category', where, data, false);

            if (update.status == 200) {
                msg += 'Actived success: ' + update.data._id + '<br>';
            }
            else {
                msg += 'Actived fail: ' + update.data._id + '<br>';
            }
        }

        req.flash('message_success', msg);
    }

    res.render('adminpanel/notice', { returnUrl: helpers.admin_helper.get_returnUrl(req, res) });
});

article_category.all('/inactive_list_id', async function (req, res) {
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.change_status);

    req.checkBody('fw_cb_items', 'Have not any item valid').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));
    }
    else {
        var msg = '';
        var items = [];

        if (typeof (req.body.fw_cb_items) == 'string') {
            items.push(req.body.fw_cb_items);
        }
        else {
            items = req.body.fw_cb_items;
        }

        for (var i = 0; i < items.length; i++) {
            let where = {
                '_id': items[i]
            };

            let data = {
                status: -1
            };

            let update = await bols.My_model.update(req, 'Article_category', where, data, false);

            if (update.status == 200) {
                msg += 'Inactived success: ' + update.data._id + '<br>';
            }
            else {
                msg += 'Inactived fail: ' + update.data._id + '<br>';
            }
        }



        req.flash('message_success', msg);
    }

    res.render('adminpanel/notice', { returnUrl: helpers.admin_helper.get_returnUrl(req, res) });
});

module.exports = article_category;