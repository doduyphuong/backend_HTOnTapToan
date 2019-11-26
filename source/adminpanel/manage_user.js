var express = require('express');
var manage_user = express.Router();
var db = require('../models');
var bols = require('../model_bols');


// /* GET home page. */
manage_user.get('/', async function(req, res) {
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);

  
  var filter = {};
  filter = helpers.helper.bind_data_filter(req);

 
  var data = {  
    start_page : 1,
    page_size : 10,
    model_name : 'Manage_user',   
    search_fields : 'username phone email',
    order : JSON.stringify({createdAt : 'desc'}),
    filter : JSON.stringify(filter),
    status_list : helpers.helper.status_list(),
    is_action : 1,
    action_list : JSON.stringify([        
        { label : 'Edit', type : 'link_button', data : 'fw_admin_goto_edit', prop : ['_id'] },
        { label : 'Detail', type : 'link_button', data : 'fw_admin_goto_detail', prop : ['_id'] }
    ])
  };
  res.render('adminpanel/manage_user/index', data);
});

//detail
manage_user.get('/detail/:id', async function(req, res, next) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);

  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Manage_user', id);
    if(item == null){
      helpers.helper.show_404(res);  
    }
  } 

   //xử lý show tên các field id
  try{
      if('id_role' in item){
        item['id_role'] = await helpers.data_helper.get_manage_role_name(item['id_role']);
      }
      
  }
  catch(e){
  }

  //nhóm
  selected_group_list = await bols.My_model.find_all('Manage_user_and_group', {'id_user' : id}, "id_group group_name");

  
  var data = {
      item : item,      
      out_fields : await bols.My_model.model_fields('Manage_user'),
      selected_group_list : selected_group_list,
      returnUrl : helpers.admin_helper.get_returnUrl(req, res)
  };

  res.render('adminpanel/manage_user/detail', data);
});

//change group
manage_user.get('/changegroup/:id', async function(req, res, next) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

  var item = null;  
  let id = req.params.id;
  let group_list = {};
  let selected_group_list = {};
  if(id != undefined){
    item = await bols.My_model.findById('Manage_user', id);
    if(item == null){
      helpers.helper.show_404(res);  
    }
    else{
      
      selected_group_list = await bols.My_model.find_all('Manage_user_and_group', {'id_user' : id}, "id_group group_name");
      let arr_not_in = [];
      for(let i = 0;i<selected_group_list.length;i++){
        arr_not_in.push(selected_group_list[i]['id_group']);
      }      
      group_list = await bols.My_model.find_all('Manage_user_group',{ _id : { '$nin' : arr_not_in } }, "_id name");     
    }
  } 
  var data = {
      item : item,
      group_list : JSON.stringify(group_list),
      selected_group_list : JSON.stringify(selected_group_list)
  };

  res.render('adminpanel/manage_user/changegroup', data);
});

manage_user.post('/changegroup/:id', async function(req, res, next) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

  var item = null;  
  let id = req.params.id;
  let group_list = {};
  let selected_group_list = {};
  if(id != undefined){
    item = await bols.My_model.findById('Manage_user', id);
    if(item == null){
      helpers.helper.show_404(res);  
    }
    else{
      req.checkBody('input_selected_group', 'Please select group').notEmpty();

      var errors = req.validationErrors();
      if(errors){
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));      
      }
      else{
        let input_arr;
        try{
          input_arr = JSON.parse(req.body.input_selected_group);              
        }
        catch(e){
          console.log(e);
        }        
        
        let del = await bols.My_model.deleteMany('Manage_user_and_group', { id_user : id});
    
        for(let i = 0;i<input_arr.length;i++){
          let its = {
            id_user : id,
            id_group : input_arr[i]['id_group'],
            group_name : input_arr[i]['group_name']           
          };
          
          let newitem = await bols.My_model.create(req, 'Manage_user_and_group', its);            
            
          }
        
        req.flash('message_success', 'Success');
      }

      selected_group_list = await bols.My_model.find_all('Manage_user_and_group', {'id_user' : id}, "id_group group_name");
      let arr_not_in = [];
      for(let i = 0;i<selected_group_list.length;i++){
        arr_not_in.push(selected_group_list[i]['id_group']);
      }      
      group_list = await bols.My_model.find_all('Manage_user_group',{ _id : { '$nin' : arr_not_in } }, "_id name");      
    }
  } 
  var data = {
      item : item,
      group_list : JSON.stringify(group_list),
      selected_group_list : JSON.stringify(selected_group_list)
  };

  res.render('adminpanel/manage_user/changegroup', data);
});


//changepass
manage_user.get('/changepass/:id', async function(req, res, next) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Manage_user', id);
    if(item == null){
      helpers.helper.show_404(res);  
    }
  } 

  var data = {
      item : item
  };

  res.render('adminpanel/manage_user/changepass', data);
});

manage_user.post('/changepass/:id', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Manage_user', id);
    //console.log(item);
    if(item == null){
      helpers.helper.show_404(res);  
    }
    else{
      req.checkBody('password', 'Password is required').notEmpty();
      req.checkBody('re_password', 'Re password is required').notEmpty();
      req.checkBody('password','Password and Repassword do not match.').equals(req.body.re_password);
      
      var errors = req.validationErrors();
      if(errors){
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));      
      }
      else{      
        let password = req.body.password + config.app.secretKey;       

        let updateItem = await bols.Manage_user.update_password(id, password);
        if(updateItem.status == 200){
          req.flash('message_success', 'Success');
          item = await bols.My_model.findById('Manage_user', id);//load lại      
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
    req : req    
  };  

  res.render('adminpanel/manage_user/changepass', data);
});

/*add*/
manage_user.get('/add', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.add);
  
  var role_list = {}; 
  role_list = await bols.My_model.find_all('Manage_role');

  //data generate ra view
  var data = {   
    status_list : helpers.helper.status_list(),
    scriptjs : '',
    role_list : role_list
  };

  res.render('adminpanel/manage_user/add', data);
});

manage_user.post('/add', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.add);

  scriptjs = '';
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password must be 8 characters or longer, at least 1 lowercase, at least 1 uppercase, at least 1 numeric and 1 special character').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/, "i").withMessage('Password must be 8 characters or longer, at least 1 lowercase, at least 1 uppercase, at least 1 numeric and 1 special character');
  req.checkBody('email', 'Email is invalid').isEmail();
  req.checkBody('phone', 'Phone is not a valid phone number').matches(/^[\d]{8,11}$/, "i").withMessage('Phone is not a valid phone number!');
  req.checkBody('fullname', 'Fullname is required').notEmpty();

  var role_list = {}; 
  role_list = await bols.My_model.find_all('Manage_role');

  var errors = req.validationErrors();
  if(errors){
    //console.log(errors);
    req.flash('message_error', helpers.helper.validator_error_message(errors));      
  }
  else{      
    let dataCreate = {
      id_role : req.body.id_role,
      username : req.body.username,
      password : req.body.password + config.app.secretKey,
      email : req.body.email,
      phone : req.body.phone,
      fullname : req.body.fullname,
      ip : helpers.helper.get_client_ip(req)
    }
    let newItem = await bols.My_model.create(req, 'Manage_user', dataCreate);
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
    status_list : helpers.helper.status_list(),  
    req : req,
    scriptjs : scriptjs,
    role_list : role_list
  };  
  res.render('adminpanel/manage_user/add', data);
});

/*edit*/
manage_user.get('/edit/:id', async function(req, res) {  

  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

  var item = null;  
  let id = req.params.id;

  var role_list = {}; 
  role_list = await bols.My_model.find_all('Manage_role');

  if(id != undefined){
    item = await bols.My_model.findById('Manage_user', id);
    if(item == null){
      helpers.helper.show_404(res);  
    }
  }

   
  //data generate ra view
  var data = {
    status_list : helpers.helper.status_list(),
    item : item,
    role_list : role_list,
    returnUrl : helpers.admin_helper.get_returnUrl(req, res)   
  };

  res.render('adminpanel/manage_user/edit', data);
});

manage_user.post('/edit/:id', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

  var item = null;  
  let id = req.params.id;

  var role_list = {}; 
  role_list = await bols.My_model.find_all('Manage_role');

  if(id != undefined){
    item = await bols.My_model.findById('Manage_user', id);
    
    if(item == null){
      helpers.helper.show_404(res);  
    }
    else{
      req.checkBody('email', 'Email is invalid').isEmail();
      req.checkBody('phone', 'Phone is not a valid phone number').matches(/^[\d]{8,11}$/, "i").withMessage('Phone is not a valid phone number!');
      req.checkBody('fullname', 'Fullname is required').notEmpty();

      var errors = req.validationErrors();
      if(errors){
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));      
      }
      else{      
        console.log(1);

        let dataUpdate = {
          phone : req.body.phone,
          email : req.body.email,
          id_role : req.body.id_role,
          fullname : req.body.fullname    
         
        }

        let where = {
          _id : id
        };

        let updateItem = await bols.My_model.update(req, 'Manage_user', where, dataUpdate, false);
        if(updateItem.status == 200){
          req.flash('message_success', 'Success');
          item = await bols.My_model.findById('Manage_user', id);//load lại      
        }
        else{
          req.flash('message_error', updateItem.data);      
        }
      }
    }
  }
  
 
  //data generate ra view
  var data = {
    status_list : helpers.helper.status_list(),
    item : item,
    req : req,
    role_list : role_list,
    returnUrl : helpers.admin_helper.get_returnUrl(req, res)
  };  

  res.render('adminpanel/manage_user/edit', data);
});



manage_user.all('/active_list_id', async function(req, res) {  
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

      let update = await bols.My_model.update(req, 'Manage_user', where, data, false);  
      
      if(update.status == 200){
        msg += 'Actived success: ' + update.data._id + '<br>'; 
      }
      else{
        msg += 'Actived fail: ' + update.data._id + '<br>'; 
      }      
    }  
    
    req.flash('message_success', msg);
  }

  res.render('adminpanel/notice', {returnUrl : helpers.admin_helper.get_returnUrl(req, res) });
});

manage_user.all('/inactive_list_id', async function(req, res) {    
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

      let update = await bols.My_model.update(req, 'Manage_user', where, data, false);  
      
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


module.exports = manage_user;