var express = require('express');
var manage_role = express.Router();
var db = require('../models');
var bols = require('../model_bols');


// /* GET home page. */
manage_role.get('/', async function(req, res) {
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);
  
  var filter = {};
  filter = helpers.helper.bind_data_filter(req);
 
  var data = {  
    start_page : 1,
    page_size : 10,
    model_name : 'Manage_role',   
    search_fields : 'name',
    order : JSON.stringify({createdAt : 'desc'}),
    filter : JSON.stringify(filter),
    is_action : 1,
    action_list : JSON.stringify([        
        { label : 'Edit', type : 'link_button', data : 'fw_admin_goto_edit', prop : ['_id'] },
        { label : 'Detail', type : 'link_button', data : 'fw_admin_goto_detail', prop : ['_id'] }
    ])
  };
  res.render('adminpanel/manage_role/index', data);
});

//detail
manage_role.get('/detail/:id', async function(req, res, next) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);

  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Manage_role', id);
    if(item == null){
      helpers.helper.show_404(res);  
    }
  }
  

  var data = {
      item : item,
      out_fields : await bols.My_model.model_fields('Manage_role'),
      returnUrl : helpers.admin_helper.get_returnUrl(req, res)
  };

  res.render('adminpanel/detail', data);
});

/*add*/
manage_role.get('/add', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.add);

  //data generate ra view
  var data = {   
    scriptjs : '',
    is_admin_values : {
      no : 0,
      yes : 1
    }
  };

  res.render('adminpanel/manage_role/add', data);
});

manage_role.post('/add', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.add);

  scriptjs = '';
  req.checkBody('name', 'Name is required').notEmpty();

  var errors = req.validationErrors();
  if(errors){
    //console.log(errors);
    req.flash('message_error', helpers.helper.validator_error_message(errors));      
  }
  else{      
    let dataCreate = {
      name : req.body.name,     
      created : 'admin',
      modified : 'admin',
      is_root : 0,
      is_admin : req.body.is_admin
    }  
      
    //Chưa có role nào có quyền root thì cho tạo role có quyền root
    let newItem = await bols.My_model.create(req, 'Manage_role', dataCreate);
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
    scriptjs : scriptjs,
    is_admin_values : {
      no : 0,
      yes : 1
    }
  };  
  res.render('adminpanel/manage_role/add', data);
});

/*edit*/
manage_role.get('/edit/:id', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Manage_role', id);
    if(item == null){
      helpers.helper.show_404(res);  
    }
  }

  
  //data generate ra view
  var data = {
    item : item,
    is_admin_values : {
      no : 0,
      yes : 1
    },
    returnUrl : helpers.admin_helper.get_returnUrl(req, res)
  };

  res.render('adminpanel/manage_role/edit', data);
});

manage_role.post('/edit/:id', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Manage_role', id);
    console.log(item);
    if(item == null){
      helpers.helper.show_404(res);  
    }
    else{
      req.checkBody('name', 'Name is required').notEmpty();      

      var errors = req.validationErrors();
      if(errors){
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));      
      }
      else{      
        let dataUpdate = {
          name : req.body.name,    
          is_admin : req.body.is_admin          
        }

        let where = {
          _id : id
        };

        let updateItem = await bols.My_model.update(req, 'Manage_role', where, dataUpdate, false);
        if(updateItem.status == 200){
          req.flash('message_success', 'Success');
          item = await bols.My_model.findById('Manage_role', id);//load lại      
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
    is_admin_values : {
      no : 0,
      yes : 1
    },
    returnUrl : helpers.admin_helper.get_returnUrl(req, res)
  };  

  res.render('adminpanel/manage_role/edit', data);
});

manage_role.all('/active_list_id', async function(req, res) {  
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

      let update = await bols.My_model.update(req, 'Manage_role', where, data, false);  
      
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

manage_role.all('/inactive_list_id', async function(req, res) {    
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

      let update = await bols.My_model.update(req, 'Manage_role', where, data, false);  
      
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

manage_role.get('/role_name/:id', async function(req, res) {
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);

  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Manage_role', id);
    if(item == null){
      res.send('undefined');  
    }
  }
  res.send(item.name);
});

module.exports = manage_role;