var express = require('express');
var manage_module = express.Router();
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var db = require('../models');
var bols = require('../model_bols');


// /* GET home page. */
manage_module.get('/', async function(req, res) {
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);
  
  var filter = {};
  filter = helpers.helper.bind_data_filter(req);
 
  var data = {
    status_list : helpers.helper.status_list(),
    start_page : 1,
    page_size : 10,
    model_name : 'Manage_module',    
    search_fields : 'name',
    order : JSON.stringify({createdAt : 'desc'}),
    filter : JSON.stringify(filter),
    is_action : 1,
    action_list : JSON.stringify([        
        { label : 'Edit', type : 'link_button', data : 'fw_admin_goto_edit', prop : ['_id'] },
        { label : 'Detail', type : 'link_button', data : 'fw_admin_goto_detail', prop : ['_id'] }
    ])
  };
  res.render('adminpanel/manage_module/index', data);
});

//detail
manage_module.get('/detail/:id', async function(req, res, next) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);

  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Manage_module', id);
    if(item == null){
      helpers.helper.show_404(res);  
    }
  }
  
   //quay về trang trước
   var returnUrl = req.query.returnUrl;
   if(!returnUrl)
   {
     returnUrl = '/adminpanel/' + res.locals.adminController;
   }

  var data = {
      item : item,
      out_fields : await bols.My_model.model_fields('Manage_module'),
      returnUrl : helpers.admin_helper.get_returnUrl(req, res)
  };

  res.render('adminpanel/detail', data);
});

/*add*/
manage_module.get('/add', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.add);

  //data generate ra view
  var data = {
    status_list : helpers.helper.status_list(),
    scriptjs : ''
  };

  res.render('adminpanel/manage_module/add', data);
});

manage_module.post('/add', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.add);

  var scriptjs = '';

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('status', 'Status is required').notEmpty();

  var errors = req.validationErrors();
  if(errors){
    //console.log(errors);
    req.flash('message_error', helpers.helper.validator_error_message(errors));      
  }
  else{
    var find_module = await bols.My_model.find_first('Manage_module', {name : req.body.name.toLocaleLowerCase()});
    if(!find_module){      
      let dataCreate = {
        name : req.body.name,
        description : req.body.description,
        status : req.body.status
      }
      let newItem = await bols.My_model.create(req, 'Manage_module', dataCreate);
      if(newItem.status == 200){
        //module builder---------------------->
        var modelName = dataCreate.name.charAt(0).toUpperCase() + dataCreate.name.slice(1);
        module_builder(modelName);

        req.flash('message_success', 'Success');      
        scriptjs = '<script>empty_all_fields();</script>';
      }
      else{
        req.flash('message_error', newItem.data);      
      }
    }
    else{
      req.flash('message_error', 'This module existed'); 
    }
  }

  //data generate ra view
  var data = {
    status_list : helpers.helper.status_list(),
    req : req,
    scriptjs : scriptjs
  };  
  res.render('adminpanel/manage_module/add', data);
});

/*edit*/
manage_module.get('/edit/:id', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);
  
  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Manage_module', id);
    if(item == null){
      helpers.helper.show_404(res);  
    }
  }

   
  //data generate ra view
  var data = {
    item : item,
    status_list : helpers.helper.status_list(),
    returnUrl : helpers.admin_helper.get_returnUrl(req, res)
  };

  res.render('adminpanel/manage_module/edit', data);
});

manage_module.post('/edit/:id', async function(req, res) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);
  
  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Manage_module', id);
    console.log(item);
    if(item == null){
      helpers.helper.show_404(res);  
    }
    else{
      req.checkBody('name', 'Name is required').notEmpty();
      req.checkBody('status', 'Status is required').notEmpty();
      req.checkBody('backend_menu_weight', 'Weight is required').notEmpty();

      var errors = req.validationErrors();
      if(errors){
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));      
      }
      else{      
        let dataUpdate = {
          name : req.body.name,
          description : req.body.description,
          status : req.body.status,
          backend_menu_weight : req.body.backend_menu_weight
        }

        let where = {
          _id : id
        };

        let updateItem = await bols.My_model.update(req, 'Manage_module', where, dataUpdate, false);
        if(updateItem.status == 200){
          req.flash('message_success', 'Success');
          item = await bols.My_model.findById('Manage_module', id);//load lại      
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
    status_list : helpers.helper.status_list(),
    req : req,
    returnUrl : helpers.admin_helper.get_returnUrl(req, res)
  };  

  res.render('adminpanel/manage_module/edit', data);
});

manage_module.all('/active_list_id', async function(req, res) {  
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

      let update = await bols.My_model.update(req, 'Manage_module', where, data, false);  
      
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

manage_module.all('/inactive_list_id', async function(req, res) {    
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

      let update = await bols.My_model.update(req, 'Manage_module', where, data, false);  
      
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


manage_module.get('/updatemodule', async function(req, res) {
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.add);  
  
  var msg = 'Update success';

  fs.readdirSync(__dirname)
  .filter(function(file){
      return (file.indexOf('.js') !== 0);
  })
  .forEach(async function(file){      
      var m = require(path.join(__dirname, file));
      var name = file.split('.')[0];      
      
      let dataCreate = {
        created : 'admin',
        modified : 'admin',
        name : name.toLowerCase(),
        description : name.toLowerCase(),
        status : 1 
      };

      var find_module = await bols.My_model.find_first('Manage_module', {name : name.toLocaleLowerCase()});
      if(!find_module){
        let newItem = await bols.My_model.create(req, 'Manage_module', dataCreate);    
        if(newItem.status == 200)
        {
          //module builder---------------------->
          var modelName = dataCreate.name.charAt(0).toUpperCase() + dataCreate.name.slice(1);
          module_builder(modelName);

          per_helper.add_module_to_current_session(req, name.toLowerCase(), 0);
        }       
      }      
  });
  
  req.flash('message_success', msg);

  var data = {    
  };

  res.render('adminpanel/manage_module/updatemodule', data);
});

manage_module.get('/module_field/:module', async function(req, res){

  var model_name = '';
  var out_fields = null;
  var out_fields_checked = {};
  if(req.params.module){
    var module = req.params.module.toLowerCase();
    var find_module = await bols.My_model.find('Manage_module', {name : module});
    
    if(find_module){
      //check quyền config của user đối với module
      let cp = await helpers.per_helper.deep_check_permission(req, res, module, helpers.per_helper.permission.config);

      module_name = module.charAt(0).toUpperCase() + module.slice(1);
      out_fields = await bols.My_model.model_fields(module_name);
      var user_data = await helpers.auth_helper.get_userdata(req);

      //tìm data cũ đã lưu
      var find = await bols.My_model.find_first('Manage_module_field', {username : user_data.username, module : module_name});      
      if(find != null){
        var str_selected_field = find.fields;
        if(str_selected_field){
          for(var i = 0;i < out_fields.length;i++)
          {
            var n = str_selected_field.indexOf(out_fields[i]);
            if(n > -1){
              out_fields_checked[out_fields[i]] = 'checked';
            }
            else{
              out_fields_checked[out_fields[i]] = '';
            }
          }  
        }
        else{
          for(var i = 0;i < out_fields.length;i++)
          {
            out_fields_checked[out_fields[i]] = '';            
          }  
        }
      }
    }
    else{
      helpers.helper.show_404(res);  
    }    
  }
  else{
    helpers.helper.show_404(res);
  }

  var data = {
    module_name : module_name,
    out_fields : out_fields,
    out_fields_checked : out_fields_checked
  }
  res.render('adminpanel/manage_module/module_field', data);
});

manage_module.post('/module_field/:module', async function(req, res){
  var model_name = '';
  var out_fields = null;
  var out_fields_checked = {};
  if(req.params.module){
    var module = req.params.module.toLowerCase();
    var find_module = await bols.My_model.find('Manage_module', {name : module});
    
    if(find_module){
      //check quyền config của user đối với module
      let cp = await helpers.per_helper.deep_check_permission(req, res, module, helpers.per_helper.permission.config);

      module_name = module.charAt(0).toUpperCase() + module.slice(1);
      out_fields = await bols.My_model.model_fields(module_name)
      var str_selected_field = '';
      for(var i = 0;i < out_fields.length;i++)
      {
        var field = req.body[out_fields[i]];
        if(field){
          str_selected_field += out_fields[i] + ' ' ;
          out_fields_checked[out_fields[i]] = 'checked';          
        }        
        else{
          out_fields_checked[out_fields[i]] = '';          
        }
      }

      if(str_selected_field != '' && str_selected_field.length > 0)
      {
        var user_data = await helpers.auth_helper.get_userdata(req);

        //xóa data cũ
        var find = await bols.My_model.find_first('Manage_module_field', {username : user_data.username, module : module_name});
        if(find != null){
          var del = await bols.My_model.delete('Manage_module_field', {_id : find._id});
        }

        //lưu data
        var data_save = {
          module : module_name,
          username : user_data.username,
          fields : str_selected_field.trim()
        };

        let item_new = await bols.My_model.create(req, 'Manage_module_field', data_save);
        if(item_new.status == 200){
          req.flash('message_success', 'Success');
        }else{
          req.flash('message_error', item_new.data);
        }
      }
      else{
        req.flash('message_error', 'Please choice some fields');
      }
    }
    else{
      helpers.helper.show_404(res);  
    }    
  }
  else{
    helpers.helper.show_404(res);
  }

  var data = {
    module_name : module_name,
    out_fields : out_fields,
    out_fields_checked : out_fields_checked
  }
  res.render('adminpanel/manage_module/module_field', data);
});

manage_module.all('/add_backend_menu', async function(req, res) {  
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
        is_backend_menu : 1
      };

      let update = await bols.My_model.update(req, 'Manage_module', where, data, false);  
      
      if(update.status == 200){
        msg += 'Success: ' + update.data._id + '<br>'; 
      }
      else{
        msg += 'Fail: ' + update.data._id + '<br>'; 
      }      
    }  
    
    req.flash('message_success', msg);
  }
  
  res.render('adminpanel/notice', {returnUrl : helpers.admin_helper.get_returnUrl(req, res) });
});

manage_module.all('/remove_backend_menu', async function(req, res) {  
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
        is_backend_menu : 0
      };

      let update = await bols.My_model.update(req, 'Manage_module', where, data, false);  
      
      if(update.status == 200){
        msg += 'Success: ' + update.data._id + '<br>'; 
      }
      else{
        msg += 'Fail: ' + update.data._id + '<br>'; 
      }      
    }  
    
    req.flash('message_success', msg);
  }
  
  res.render('adminpanel/notice', {returnUrl : helpers.admin_helper.get_returnUrl(req, res) });
});


//Function build tool
function module_builder(model_name){  
  if(__env != 'production')
  {
    //create folder view
    var dir_folder_views = __base + '/views/adminpanel/' + model_name.toLowerCase() + '/';
    mkdirp.sync(dir_folder_views);

    //controller
    fs.readFile(__base + '/builder/builder.html', 'utf8', async function read(err, data) {
      try{
      
          if (err) {
              console.log(err);
              throw err;
          }

          var fields = await bols.My_model.model_fields(model_name);
          var controller_validate_form = '';
          var controller_data_form = '{' + '\n';

          if(fields.length > 0){
            var c = fields.length;
            for(var i = 0;i<c;i++){
              var s_field_name = fields[i];
              if(s_field_name != 'created' && s_field_name != 'modified' && s_field_name != '_id' && s_field_name != 'createdAt' && s_field_name != 'updatedAt' && s_field_name != '__v')
              {
                var s = 'req.checkBody("' + s_field_name + '", "' + s_field_name + ' is required").notEmpty();' + '\n';
                controller_validate_form = controller_validate_form + s;

                if(i < c -1){
                  controller_data_form += '"' + s_field_name + '"' + ':' + 'req.body.' + s_field_name + ',' + '\n';        
                }
                else{
                  controller_data_form += '"' + s_field_name + '"' + ':' + 'req.body.' + s_field_name + '' + '\n';        
                }         
              }        
            }
          }
          controller_data_form = controller_data_form + '}';

          content = data;
          content = content.replace(/###ModelName###/gi, model_name);
          content = content.replace(/###Controller###/gi, model_name.toLowerCase());      
          content = content.replace(/###ViewFolder###/gi, model_name.toLowerCase());  
          content = content.replace(/###DataCreate###/gi, controller_data_form);
          content = content.replace(/###DataUpdate###/gi, controller_data_form);
          content = content.replace(/###ControllerValidateForm###/gi, controller_validate_form);

          var dir = __base + '/adminpanel/';
          mkdirp.sync(dir);

          var file_name = model_name.toLowerCase() + '.js';
          let stream = fs.createWriteStream(dir + file_name , {flags: 'w'});
              stream.end(content);
      }
      catch(e){

      }
    });

    //views/
    fs.readFile(__base + '/builder/views/index.ejs', 'utf8',async function read(err, data) {
      try{
        if (err) {
            console.log(err);
            throw err;
        }
        content = data;
        content = content.replace(/###ModelName###/gi, model_name);

        var dir = dir_folder_views;    

        var file_name = 'index.ejs'
        let stream = fs.createWriteStream(dir + file_name , {flags: 'w'});
            stream.end(content);
      }
      catch(e){

      }
    });


    //add/
    fs.readFile(__base + '/builder/views/add.ejs', 'utf8', async function read(err, data) {
      try{
        if (err) {
            console.log(err);
            throw err;
        }

        var fields = await bols.My_model.model_fields(model_name);
        var html_element = '<div class="row">\n<div class="col-sm-12">\n<div class="form-group">\n<label for="###field_name###">###field_name_label###</label>\n<input name="###field_name###" class="form-control" id="###field_name###" type="text" placeholder="Enter ###field_name###" value="<%=helpers.helper.view_data(appPostParam.###field_name###)%>">\n</div>\n</div>\n</div>' + '\n\n';
        var content_generate = '';

        if(fields.length > 0){
          var c = fields.length;
          for(var i = 0;i<c;i++){
            var s_field_name = fields[i];
            if(s_field_name != 'created' && s_field_name != 'modified' && s_field_name != '_id' && s_field_name != 'createdAt' && s_field_name != 'updatedAt' && s_field_name != '__v')
            {
              var s = html_element;
              s = s.replace(/###field_name###/gi, s_field_name);
              var label = s_field_name.charAt(0).toUpperCase() + s_field_name.slice(1)
              s = s.replace(/###field_name_label###/gi, label);      
              content_generate += s;             
            }        
          }
        }

        content = data;
        content = content.replace(/###FormFields###/gi, content_generate);

        var dir = dir_folder_views;   

        var file_name = 'add.ejs'
        let stream = fs.createWriteStream(dir + file_name , {flags: 'w'});
            stream.end(content);
      }
      catch(e){

      }
    });

    //edit/
    fs.readFile(__base + '/builder/views/edit.ejs', 'utf8', async function read(err, data) {
      try{
        if (err) {
            console.log(err);
            throw err;
        }

        var fields = await bols.My_model.model_fields(model_name);
        var html_element = '<div class="row">\n<div class="col-sm-12">\n<div class="form-group">\n<label for="###field_name###">###field_name_label###</label>\n<input name="###field_name###" class="form-control" id="###field_name###" type="text" placeholder="Enter ###field_name###" value="<%=item.###field_name###%>">\n</div>\n</div>\n</div>' + '\n\n';
        var content_generate = '';

        if(fields.length > 0){
          var c = fields.length;
          for(var i = 0;i<c;i++){
            var s_field_name = fields[i];
            if(s_field_name != 'created' && s_field_name != 'modified' && s_field_name != '_id' && s_field_name != 'createdAt' && s_field_name != 'updatedAt' && s_field_name != '__v')
            {
              var s = html_element;
              s = s.replace(/###field_name###/gi, s_field_name);
              var label = s_field_name.charAt(0).toUpperCase() + s_field_name.slice(1);
              s = s.replace(/###field_name_label###/gi, label);      
              content_generate += s;             
            }        
          }
        }

        content = data;
        content = content.replace(/###FormFields###/gi, content_generate);

        var dir = dir_folder_views;
      
        var file_name = 'edit.ejs'
        let stream = fs.createWriteStream(dir + file_name , {flags: 'w'});
            stream.end(content);
      }
      catch(e){

      }
    });
  }// ------------------ end if env
}

module.exports = manage_module;