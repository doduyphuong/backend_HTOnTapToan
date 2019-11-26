var express = require('express');
var permission_role = express.Router();
var db = require('../models');
var bols = require('../model_bols');

permission_role.get('/', async function(req, res) {   
    var data = {};
    res.render('adminpanel/index', data);
});

permission_role.get('/manages', async function(req, res){
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

    scriptjs = '';

    var module_list = {};
    module_list = await bols.My_model.find_all('Manage_module');

    var role_list = {}; 
    role_list = await bols.My_model.find_all('Manage_role', { is_root : 0 });
    var first_role = null
    if(role_list.length > 0)
    {
        first_role = role_list[0];    

        var permissions = await helpers.per_helper.permission;
        var keys = Object.keys(permissions);

        //proccessing data first role
        for(var i = 0; i<module_list.length; i++){
            let permission_value = await helpers.per_helper.get_permission_value_role(first_role._id, module_list[i].name);        
            for(var j = 0; j < keys.length; j++){
                let per_key = keys[j];
                module_list[i][per_key] = await helpers.per_helper.check_permission_val(permission_value, permissions[per_key]);     
            }
        }
    }
    else{
        return helpers.helper.redirect(res, '/adminpanel/error/701');
    } 

    var data ={
        role_list : role_list,
        id_role : first_role._id,        
        scriptjs : scriptjs,
        list_permission : helpers.per_helper.permission,
        module_list : module_list
    };
    res.render('adminpanel/permission_role/manages', data);
});

permission_role.post('/manages', async function(req, res){   
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

    scriptjs = '';
    let id_role = '0';
    var role_list = {}; 
    role_list = await bols.My_model.find_all('Manage_role');

    var module_list = {};
    module_list = await bols.My_model.find_all('Manage_module');

    let permissions = helpers.per_helper.permission;
    let keys = Object.keys(permissions);

    req.checkBody('id_role', 'Please select role').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));      
    }
    else{
        //delete quyền cũ của role
        let del = await bols.My_model.deleteMany('Manage_permission_role', { id_role : req.body.id_role});

        //Lưu lại quyền mới theo role
        
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

            //console.log(module_list[i].name + ' : ' + permission_value);            
            var data_permission_role = {             
                id_role : req.body.id_role,
                module : module_list[i].name,
                permission_value : permission_value
            }

            var insertNew = await bols.My_model.create(req, 'Manage_permission_role', data_permission_role);
        }

        //console.log(errors);
        req.flash('message_success', 'Update success');
        
        //proccessing data first role
        id_role = req.body.id_role;
        for(var i = 0; i<module_list.length; i++){
            let permission_value = await helpers.per_helper.get_permission_value_role(req.body.id_role, module_list[i].name);        
            for(var j = 0; j < keys.length; j++){
                let per_key = keys[j];
                module_list[i][per_key] = await helpers.per_helper.check_permission_val(permission_value, permissions[per_key]);     
            }
        }
    }    

    var data = {
        role_list : role_list,
        id_role : id_role,         
        scriptjs : scriptjs,
        list_permission : helpers.per_helper.permission,
        module_list : module_list
    };
    res.render('adminpanel/permission_role/manages', data);
});

permission_role.post('/get_permission_of_role', async function(req, res){
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.edit);

    var id_role = req.body.id_role;
    var data = {};

    if(id_role){
        var role_list = {}; 
        role_list = await bols.My_model.find_all('Manage_role');

        var module_list = {};
        module_list = await bols.My_model.find_all('Manage_module');

        var permissions = await helpers.per_helper.permission;
        var keys = Object.keys(permissions);

        //proccessing data first role
        for(var i = 0; i<module_list.length; i++){
            let permission_value = await helpers.per_helper.get_permission_value_role(id_role, module_list[i].name);        
            for(var j = 0; j < keys.length; j++){
                let per_key = keys[j];
                module_list[i][per_key] = await helpers.per_helper.check_permission_val(permission_value, permissions[per_key]);     
            }
        }

        var data ={
            role_list : role_list,            
            scriptjs : scriptjs,
            list_permission : helpers.per_helper.permission,
            module_list : module_list
        };
    }

    
    res.render('adminpanel/permission_role/get_permission_of_role', data);
});


module.exports = permission_role;