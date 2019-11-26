var express = require('express');
var demo = express.Router();
var db = require('../models');
var bols = require('../model_bols');


// /* GET home page. */
demo.get('/', async function(req, res) {
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);
  
  var filter = {};
  filter = helpers.helper.bind_data_filter(req);
 
  var data = {  
    start_page : 1,
    page_size : 10,
    model_name : 'Demo',   
    search_fields : '',
    order : JSON.stringify({createdAt : 'desc'}),
    filter : JSON.stringify(filter),
    is_action : 1,
    action_list : JSON.stringify([        
        { label : 'Edit', type : 'link_button', data : 'fw_admin_goto_edit', prop : ['_id'] },
        { label : 'Detail', type : 'link_button', data : 'fw_admin_goto_detail', prop : ['_id'] }
    ])
  };
  res.render('adminpanel/demo/index', data);
});

/*detail*/
demo.get('/detail/:id', async function(req, res, next) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);

  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Demo', id);
    if(item == null){
      helpers.helper.show_404(res);  
    }
  }  

  var data = {
      item : item,
      out_fields : await bols.My_model.model_fields('Demo'),
      returnUrl : helpers.admin_helper.get_returnUrl(req, res)
  };

  res.render('adminpanel/detail', data);
});

/*add*/
demo.get('/add', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.add);

  //data generate ra view
  var data = {   
    scriptjs : ''
  };

  res.render('adminpanel/demo/add', data);
});

demo.post('/add', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.add);

  scriptjs = '';

  req.checkBody("cate_id", "cate_id is required").notEmpty();
req.checkBody("title", "title is required").notEmpty();
req.checkBody("description", "description is required").notEmpty();


  var errors = req.validationErrors();
  if(errors){   
    req.flash('message_error', helpers.helper.validator_error_message(errors));      
  }
  else{      
    let dataCreate = {
"cate_id":req.body.cate_id,
"title":req.body.title,
"description":req.body.description,
};  
      
    //Chưa có role nào có quyền root thì cho tạo role có quyền root
    let newItem = await bols.My_model.create(req, 'Demo', dataCreate);
    if(newItem.status == 200){
      req.flash('message_success', 'Success');   
      scriptjs = '<script>empty_all_fields();</script>';   
    }
    else{
      req.flash('message_error', newItem.data);      
    }     
  }

  //data generate ra view
  var data = {  
    req : req,
    scriptjs : scriptjs
  };  
  res.render('adminpanel/demo/add', data);
});

/*edit*/
demo.get('/edit/:id', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Demo', id);
    if(item == null){
      helpers.helper.show_404(res);  
    }
  }

  
  //data generate ra view
  var data = {
    item : item,
    returnUrl : helpers.admin_helper.get_returnUrl(req, res)
  };

  res.render('adminpanel/demo/edit', data);
});

demo.post('/edit/:id', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Demo', id);
    console.log(item);
    if(item == null){
      helpers.helper.show_404(res);  
    }
    else{
       req.checkBody("cate_id", "cate_id is required").notEmpty();
req.checkBody("title", "title is required").notEmpty();
req.checkBody("description", "description is required").notEmpty();
   

      var errors = req.validationErrors();
      if(errors){
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));      
      }
      else{      
        let dataUpdate = {
"cate_id":req.body.cate_id,
"title":req.body.title,
"description":req.body.description,
};

        let where = {
          _id : id
        };

        let updateItem = await bols.My_model.update(req, 'Demo', where, dataUpdate, false);
        if(updateItem.status == 200){
          req.flash('message_success', 'Success');
          item = await bols.My_model.findById('Demo', id);//load lại      
        }
        else{
          req.flash('message_error', updateItem.data);      
        }
      }
    }
  }  

  //data generate ra view
  var data = {
    item : item,
    req : req,
    returnUrl : helpers.admin_helper.get_returnUrl(req, res)
  };  

  res.render('adminpanel/demo/edit', data);
});

demo.all('/active_list_id', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.change_status);

  req.checkBody('fw_cb_items', 'Have not any item valid').notEmpty();  
  var errors = req.validationErrors();
  if(errors){
    //console.log(errors);
    req.flash('message_error', helpers.helper.validator_error_message(errors));      
  }
  else{
    var msg = '';    
    var items = [];

    if(typeof(req.body.fw_cb_items) == 'string'){
      items.push(req.body.fw_cb_items);
    }
    else{
      items = req.body.fw_cb_items;
    }
    
    for(var i = 0;i< items.length; i ++)
    {
      let where = {
        '_id' : items[i]
      };

      let data = {
        status : 1
      };

      let update = await bols.My_model.update(req, 'Demo', where, data, false);  
      
      if(update.status == 200){
        msg += 'Actived success: ' + update.data._id + '<br>'; 
      }
      else{
        msg += 'Actived fail: ' + update.data._id + '<br>'; 
      }      
    }  
    
    req.flash('message_success', msg);
  }
  res.render('adminpanel/notice', {returnUrl : helpers.admin_helper.get_returnUrl(req, res)});
});

demo.all('/inactive_list_id', async function(req, res) {    
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.change_status);
  
  req.checkBody('fw_cb_items', 'Have not any item valid').notEmpty();  
  var errors = req.validationErrors();
  if(errors){
    //console.log(errors);
    req.flash('message_error', helpers.helper.validator_error_message(errors));      
  }
  else{
    var msg = '';    
    var items = [];

    if(typeof(req.body.fw_cb_items) == 'string'){
      items.push(req.body.fw_cb_items);
    }
    else{
      items = req.body.fw_cb_items;
    }
    
    for(var i = 0;i< items.length; i ++)
    {
      let where = {
        '_id' : items[i]
      };

      let data = {
        status : -1
      };

      let update = await bols.My_model.update(req, 'Demo', where, data, false);  
      
      if(update.status == 200){
        msg += 'Inactived success: ' + update.data._id + '<br>'; 
      }
      else{
        msg += 'Inactived fail: ' + update.data._id + '<br>'; 
      }      
    }

    req.flash('message_success', msg);
  }

  res.render('adminpanel/notice', {returnUrl : helpers.admin_helper.get_returnUrl(req, res) });
});


module.exports = demo;