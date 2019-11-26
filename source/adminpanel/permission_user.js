var express = require('express');
var permission_user = express.Router();
var db = require('../models');
var bols = require('../model_bols');

permission_user.get('/', async function(req, res) {   
    var data = {};
    res.render('adminpanel/index', data);
});

permission_user.get('/manages/:id', async function(req, res){
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

    scriptjs = '';
    
    var id_user = req.params.id;
    
    var user = await bols.My_model.findById('Manage_user', id_user);

    if(user != null)
    {
        var module_list = {};
        module_list = await bols.My_model.find_all('Manage_module');

        var permissions = await helpers.per_helper.permission;
        var keys = Object.keys(permissions);


        if(user.permission_type == 'customize'){
            //proccessing data first role
            for(var i = 0; i<module_list.length; i++){
                let permission_value = await helpers.per_helper.get_permission_value_user(user.username, module_list[i].name);        
                for(var j = 0; j < keys.length; j++){
                    let per_key = keys[j];
                    module_list[i][per_key] = await helpers.per_helper.check_permission_val(permission_value, permissions[per_key]);     
                }
            }
        }
        else{
            var role_of_user = await bols.My_model.findById('Manage_role', user.id_role);
            if(role_of_user.is_root == 1){
                for(var i = 0; i<module_list.length; i++){
                    let permission_value = await helpers.per_helper.get_full_permission_value();        
                    for(var j = 0; j < keys.length; j++){
                        let per_key = keys[j];
                        module_list[i][per_key] = await helpers.per_helper.check_permission_val(permission_value, permissions[per_key]);     
                    }
                }    
            }
            else{
                for(var i = 0; i<module_list.length; i++){
                    let permission_value = await helpers.per_helper.get_permission_value_role(user.id_role, module_list[i].name);        
                    for(var j = 0; j < keys.length; j++){
                        let per_key = keys[j];
                        module_list[i][per_key] = await helpers.per_helper.check_permission_val(permission_value, permissions[per_key]);     
                    }
                }
            }            
        }
    }

    var data ={
        user : user,
        scriptjs : scriptjs,
        list_permission : helpers.per_helper.permission,
        module_list : module_list
    };
    res.render('adminpanel/permission_user/manages', data);
});

permission_user.post('/manages/:id', async function(req, res){   
    //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

    scriptjs = '';
    
    var id_user = req.params.id;
    console.log(id_user);
    var user = await bols.My_model.findById('Manage_user', id_user);

    if(user != null)
    {

        var module_list = {};
        module_list = await bols.My_model.find_all('Manage_module');

        let permissions = helpers.per_helper.permission;
        let keys = Object.keys(permissions);

        req.checkBody('id_user', 'User invalid').notEmpty();
        var errors = req.validationErrors();
        if(errors){
            //console.log(errors);
            req.flash('message_error', helpers.helper.validator_error_message(errors));      
        }
        else{
            //delete quyền cũ của user
            let del = await bols.My_model.deleteMany('Manage_permission_user', { username : user.username});

            //Lưu lại quyền mới theo user            
            let l = module_list.length;
            for(var i = 0; i < l; i++){
                var permission_value = 0;
                let k_l = keys.length;
                for(var j = 0;j<k_l;j++){
                    try{
                        let rquest = req.body[ module_list[i].name + '_' + keys[j]];
                        if(rquest != undefined && rquest != '')
                        {
                            permission_value += parseInt(permissions[keys[j]]);
                        }                    
                    }
                    catch(e){
                        console.log(e);
                    }
                }

                //add permission user
                var data_permission_user = {                    
                    username : user.username,
                    module : module_list[i].name,
                    permission_value : permission_value
                }

                var insertNew = await bols.My_model.create(req, 'Manage_permission_user', data_permission_user);

                //update permission_type cho user -----
                var data_permission_type = {
                    permission_type : "customize"
                }

                var updateItem = await bols.My_model.update(req, 'Manage_user', { _id : user._id }, data_permission_type, false);
            }

            //console.log(errors);
            req.flash('message_success', 'Update success');
            
            //proccessing data first role
            
            for(var i = 0; i<module_list.length; i++){
                let permission_value = await helpers.per_helper.get_permission_value_user(user.username, module_list[i].name);        
                for(var j = 0; j < keys.length; j++){
                    let per_key = keys[j];
                    module_list[i][per_key] = await helpers.per_helper.check_permission_val(permission_value, permissions[per_key]);     
                }
            }
        }
    }

    var data = {
        user : user,            
        scriptjs : scriptjs,
        list_permission : helpers.per_helper.permission,
        module_list : module_list
    };
    res.render('adminpanel/permission_user/manages', data);
});

module.exports = permission_user;