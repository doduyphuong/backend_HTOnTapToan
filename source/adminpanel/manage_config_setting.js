var express = require('express');
var manage_config_setting = express.Router();
var db = require('../models');
var bols = require('../model_bols');
var fs = require('fs');
var nconf = require('nconf');
nconf.argv().env().file({ file: __base + 'config_setting/config.json' });

// /* GET home page. */
manage_config_setting.get('/', async function(req, res) {
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);
    
    var filter = {};
    filter = helpers.helper.bind_data_filter(req);
   
    var data = {  
      start_page : 1,
      page_size : 15,
      model_name : 'Manage_config_setting',    
      search_fields : 'key value',
      order : JSON.stringify({createdAt : 'desc'}),
      filter : JSON.stringify(filter),
      is_action : 1,
      action_list : JSON.stringify([        
          { label : 'Edit', type : 'link_button', data : 'fw_admin_goto_edit', prop : ['_id'] },
          { label : 'Detail', type : 'link_button', data : 'fw_admin_goto_detail', prop : ['_id'] }
      ])
    };
    res.render('adminpanel/manage_config_setting/index', data);
});

//detail
manage_config_setting.get('/detail/:id', async function(req, res, next) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);

  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Manage_config_setting', id);
    if(item == null){
      helpers.helper.show_404(res);  
    }
  }  

  var data = {
      item : item,
      out_fields : await bols.My_model.model_fields('Manage_config_setting'),
      returnUrl : helpers.admin_helper.get_returnUrl(req, res)
  };

  res.render('adminpanel/detail', data);
});

manage_config_setting.get('/add', async function(req, res) {  
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.add);
    
     
    //data generate ra view
    var data = {        
      scriptjs : ''
    };
  
    res.render('adminpanel/manage_config_setting/add', data);
});

manage_config_setting.post('/add', async function(req, res) {  
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.add);
  
    scriptjs = '';
    req.checkBody('key', 'Key is required').notEmpty();
    req.checkBody('value', 'Value is required');
    
  
    var role_list = {}; 
    role_list = await bols.My_model.find_all('Manage_role');
  
    var errors = req.validationErrors();
    if(errors){
      //console.log(errors);
      req.flash('message_error', helpers.helper.validator_error_message(errors));      
    }
    else{      
      let dataCreate = {
        key : req.body.key,
        value : req.body.value,
        status : 1
      }

      let newItem = await bols.My_model.create(req, 'Manage_config_setting', dataCreate);
      if(newItem.status == 200){
        //add config to json
        let config_list = await bols.My_model.find_all('Manage_config_setting', { status : 1 }, 'key value');
        for(var i = 0;i<config_list.length;i++){
          nconf.set(config_list[i].key, config_list[i].value);          
        }

        nconf.save(function (err) {
          fs.readFile( __base + 'config_setting/config.json', function (err, data) {
            console.dir(JSON.parse(data.toString()))
          });
        });


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
        role_list : role_list
    };  
    res.render('adminpanel/manage_config_setting/add', data);
});


manage_config_setting.all('/active_list_id', async function(req, res) {  
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
  
        let update = await bols.My_model.update(req, 'Manage_config_setting', where, data, false);  
        
        if(update.status == 200){
           //add config to json
          let config_list = await bols.My_model.find_all('Manage_config_setting', { status : 1 }, 'key value');
          for(var i = 0;i<config_list.length;i++){
            nconf.set(config_list[i].key, config_list[i].value);          
          }

          nconf.save(function (err) {
            fs.readFile( __base + 'config_setting/config.json', function (err, data) {
              console.dir(JSON.parse(data.toString()))
            });
          });

          msg += 'Actived success: ' + update.data._id + '<br>'; 
        }
        else{
          msg += 'Actived fail: ' + update.data._id + '<br>'; 
        }      
      }  
      
      req.flash('message_success', msg);
    }  

    res.render('adminpanel/notice', {returnUrl :  helpers.admin_helper.get_returnUrl(req, res) });
  });
  
  manage_config_setting.all('/inactive_list_id', async function(req, res) {    
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
  
        let update = await bols.My_model.update(req, 'Manage_config_setting', where, data, false);  
        
        if(update.status == 200){
           //add config to json
          let config_list = await bols.My_model.find_all('Manage_config_setting', { status : 1 }, 'key value');
          for(var i = 0;i<config_list.length;i++){
            nconf.set(config_list[i].key, config_list[i].value);          
          }

          nconf.save(function (err) {
            fs.readFile( __base + 'config_setting/config.json', function (err, data) {
              console.dir(JSON.parse(data.toString()))
            });
          });

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
  

/*edit*/
manage_config_setting.get('/edit/:id', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Manage_config_setting', id);
    if(item == null){
      helpers.helper.show_404(res);  
    }
  }  
  
  //data generate ra view
  var data = {
    item : item,
    returnUrl : helpers.admin_helper.get_returnUrl(req, res)
  };

  res.render('adminpanel/manage_config_setting/edit', data);
});

manage_config_setting.post('/edit/:id', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Manage_config_setting', id);
    console.log(item);
    if(item == null){
      helpers.helper.show_404(res);  
    }
    else{
      req.checkBody('value', 'Value is required').notEmpty();      

      var errors = req.validationErrors();
      if(errors){
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));      
      }
      else{      
        let dataUpdate = {
          value : req.body.value          
        }

        let where = {
          _id : id
        };

        let updateItem = await bols.My_model.update(req, 'Manage_config_setting', where, dataUpdate, false);
        if(updateItem.status == 200){
          
           //add config to json
          let config_list = await bols.My_model.find_all('Manage_config_setting', { status : 1 }, 'key value');
          for(var i = 0;i<config_list.length;i++){
            nconf.set(config_list[i].key, config_list[i].value);          
          }

          nconf.save(function (err) {
            fs.readFile( __base + 'config_setting/config.json', function (err, data) {
              console.dir(JSON.parse(data.toString()))
            });
          });


          req.flash('message_success', 'Success');
          item = await bols.My_model.findById('Manage_config_setting', id);//load lại      
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

  res.render('adminpanel/manage_config_setting/edit', data);
});
  
module.exports = manage_config_setting;