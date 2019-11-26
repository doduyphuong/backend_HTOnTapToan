var express = require('express');
var article = express.Router();
var db = require('../models');
var bols = require('../model_bols');


// /* GET home page. */
article.get('/', async function (req, res) {
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);

    var filter = {};
    filter = helpers.helper.bind_data_filter(req);

    var data = {
        start_page: 1,
        page_size: 10,
        model_name: 'Article',
        search_fields: 'cate_id',
        order: JSON.stringify({ createdAt: 'desc' }),
        filter: JSON.stringify(filter),
        is_action : 1,
        action_list : JSON.stringify([        
            { label : 'Edit', type : 'link_button', data : 'fw_admin_goto_edit', prop : ['_id'] },
            { label : 'Detail', type : 'link_button', data : 'fw_admin_goto_detail', prop : ['_id'] }
        ])
    };
    res.render('adminpanel/article/index', data);
});

//detail
article.get('/detail/:id', async function (req, res, next) {
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);

    var item = null;
    let id = req.params.id;

    if (id != undefined) {
        item = await bols.My_model.findById('Article', id);
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
        out_fields: await bols.My_model.model_fields('Article'),
        returnUrl: helpers.admin_helper.get_returnUrl(req, res)
    };

    res.render('adminpanel/detail', data);
});

/*add*/
article.get('/add', async function (req, res) {
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.add);

    //data generate ra view
    var data = {
        status_list: helpers.helper.status_list(),
        scriptjs: ''
    };

    res.render('adminpanel/article/add', data);
});

article.post('/add', async function (req, res) {
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.add);

    var scriptjs = '';
    req.checkBody('cate_id', 'Cate_id is required').notEmpty();
    req.checkBody('publish_date', 'Publish_date is required').notEmpty();
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('image', 'Image is required').notEmpty();
    req.checkBody('image_alt', 'Image_alt is required').notEmpty();
    req.checkBody('description', 'Description is required').notEmpty();
    req.checkBody('note_1', 'Note_1 is required').notEmpty();
    req.checkBody('note_2', 'Note_2 is required').notEmpty();
    req.checkBody('note_3', 'Note_3 is required').notEmpty();
    req.checkBody('note_4', 'Note_4 is required').notEmpty();
    req.checkBody('note_5', 'Note_5 is required').notEmpty();
    //req.checkBody('data_image', 'Data_image is required').notEmpty();
    req.checkBody('main_content', 'Main_content is required').notEmpty();
    req.checkBody('seo_title', 'SEO_title is required').notEmpty();
    req.checkBody('seo_description', 'SEO_description is required').notEmpty();
    req.checkBody('seo_keyword', 'SEO_keyword is required').notEmpty();
    req.checkBody('status', 'Status is required').notEmpty();
    // req.checkBody('is_hot', 'Is_hot is required').notEmpty();


    var errors = req.validationErrors();
    if (errors) {
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));
    }
    else {

        var tmp = {
            note_1: req.body.note_1,
            note_2: req.body.note_2,
            note_3: req.body.note_3,
            note_4: req.body.note_4,
            note_5: req.body.note_5
        }
        var date_format = helpers.helper.standard_datetime(req.body.publish_date);
        var slug_format = helpers.helper.to_slug(req.body.title);
        let dataCreate = {
            cate_id: req.body.cate_id,
            publish_date: date_format,
            title: req.body.title,
            description: req.body.description,
            image: req.body.image,
            image_alt: req.body.image_alt,
            data_image: 'req.body.data_image',
            main_content: req.body.main_content,
            data: JSON.stringify(tmp),
            seo_title: req.body.seo_title,
            seo_description: req.body.seo_description,
            seo_keyword: req.body.seo_keyword,
            slug: slug_format,
            status: req.body.status
        }
        let newItem = await bols.My_model.create(req, 'Article', dataCreate);
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
        status_list : helpers.helper.status_list(),
        status_list: helpers.helper.status_list(),
        req: req,
        scriptjs: scriptjs
    };
    res.render('adminpanel/article/add', data);
});

/* edit */
article.get('/edit/:id', async function (req, res) {
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

    var item = null;
    let id = req.params.id;

    if (id != undefined) {
        item = await bols.My_model.findById('Article', id);
        if (item == null) {
            helpers.helper.show_404(res);
        }
    }

    //data generate ra view
    var data = {
        status_list : helpers.helper.status_list(),
        item: item,
        returnUrl: helpers.admin_helper.get_returnUrl(req, res)
    };

    res.render('adminpanel/article/edit', data);
});

article.post('/edit/:id', async function (req, res) {
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

    var item = null;
    let id = req.params.id;

    if (id != undefined) {
        item = await bols.My_model.findById('Article', id);
        console.log(item);
        if (item == null) {
            helpers.helper.show_404(res);
        }
        else {
            req.checkBody('cate_id', 'Cate_id is required').notEmpty();
            req.checkBody('publish_date', 'Publish_date is required').notEmpty();
            req.checkBody('title', 'Title is required').notEmpty();
            req.checkBody('image', 'Image is required').notEmpty();
            req.checkBody('image_alt', 'Image_alt is required').notEmpty();
            req.checkBody('description', 'Description is required').notEmpty();
            req.checkBody('note_1', 'Note_1 is required').notEmpty();
            req.checkBody('note_2', 'Note_2 is required').notEmpty();
            req.checkBody('note_3', 'Note_3 is required').notEmpty();
            req.checkBody('note_4', 'Note_4 is required').notEmpty();
            req.checkBody('note_5', 'Note_5 is required').notEmpty();
            //req.checkBody('data_image', 'Data_image is required').notEmpty();
            req.checkBody('main_content', 'Main_content is required').notEmpty();
            req.checkBody('seo_title', 'SEO_title is required').notEmpty();
            req.checkBody('seo_description', 'SEO_description is required').notEmpty();
            req.checkBody('seo_keyword', 'SEO_keyword is required').notEmpty();
            req.checkBody('status', 'Status is required').notEmpty();
            req.checkBody('is_hot', 'Is_hot is required').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                //console.log(errors);
                req.flash('message_error', helpers.helper.validator_error_message(errors));
            }
            else {
                var tmp = {
                    note_1: req.body.note_1,
                    note_2: req.body.note_2,
                    note_3: req.body.note_3,
                    note_4: req.body.note_4,
                    note_5: req.body.note_5
                }
                var date_format = helpers.helper.standard_datetime(req.body.publish_date);
                let dataUpdate = {
                    cate_id: req.body.cate_id,
                    publish_date: date_format,
                    title: req.body.title,
                    description: req.body.description,
                    image: req.body.image,
                    image_alt: req.body.image_alt,
                    data_image: 'req.body.data_image',
                    main_content: req.body.main_content,
                    data: JSON.stringify(tmp),
                    seo_title: req.body.seo_title,
                    seo_description: req.body.seo_description,
                    seo_keyword: req.body.seo_keyword,
                    status: req.body.status,
                    is_hot: req.body.is_hot
                }

                let where = {
                    _id: id
                };

                let updateItem = await bols.My_model.update(req, 'Article', where, dataUpdate, false);
                if (updateItem.status == 200) {
                    req.flash('message_success', 'Success');
                    item = await bols.My_model.findById('Article', id);//load lại      
                }
                else {
                    req.flash('message_error', updateItem.data);
                }
            }
        }
    }

    //data generate ra view
    var data = {
        item: item,
        req: req,
        status_list: helpers.helper.status_list(),
        returnUrl: helpers.admin_helper.get_returnUrl(req, res)
    };

    res.render('adminpanel/article/edit', data);
});

article.all('/active_list_id', async function (req, res) {
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

            let update = await bols.My_model.update(req, 'Article', where, data, false);

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

article.all('/inactive_list_id', async function (req, res) {
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

            let update = await bols.My_model.update(req, 'Article', where, data, false);

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

module.exports = article;