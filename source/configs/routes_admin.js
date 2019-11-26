var express = require('express');
var routes_admin = express.Router();
var db = require('../models');
var bols = require('../model_bols');

//middleware
var mdw_admin = (async function (req, res, next) {     

    //define controller & action
    var r = await helpers.admin_helper.define_controller_action(req, res);
    var controller = r.controller;//module name
    var action = r.action;//action    

    //Check đăng nhập
    let is_authenticated = await helpers.auth_helper.is_authenticated(req);    
    if( is_authenticated == true)
    {    
        //Lấy thông tin user    
        var user_data = await helpers.auth_helper.get_userdata(req);       

        //log admin
        await helpers.admin_helper.write_log_admin(req, res, user_data, controller, action);

        if(user_data.is_admin == 0 || user_data == null){
            //không phải role access vào admin tool thì clear session sút ra ngoài
            let logout = await helpers.auth_helper.delete_userdata(req);
            return helpers.helper.redirect(res, '/adminpanel/error/401');
        }
        else{           
            // vào trong check quyền tại controller-action 
            let set_local_user_data = await helpers.auth_helper.set_local_user_data(res, user_data);         
        }
    }
    else{
        if(req.originalUrl){
            return helpers.helper.redirect(res, '/adminpanel/login?returnUrl=' + encodeURI(__baseUrl + req.originalUrl));
        }
        else{
            return helpers.helper.redirect(res, '/adminpanel/login');
        }        
    }

    next();
});


var index = require('../adminpanel/index');
routes_admin.use('/',index);

var manage_admin_log = require('../adminpanel/manage_admin_log');
routes_admin.use('/manage_admin_log', mdw_admin, manage_admin_log);

var base = require('../adminpanel/base');
routes_admin.use('/base', mdw_admin, base);

var manage_user_group = require('../adminpanel/manage_user_group');
routes_admin.use('/manage_user_group', mdw_admin, manage_user_group);

var manage_role = require('../adminpanel/manage_role');
routes_admin.use('/manage_role', mdw_admin, manage_role);

var manage_user = require('../adminpanel/manage_user');
routes_admin.use('/manage_user', mdw_admin, manage_user);

var manage_module = require('../adminpanel/manage_module');
routes_admin.use('/manage_module', mdw_admin, manage_module);

var permission_role = require('../adminpanel/permission_role');
routes_admin.use('/permission_role', mdw_admin, permission_role);

var permission_user = require('../adminpanel/permission_user');
routes_admin.use('/permission_user', mdw_admin, permission_user);

var profile = require('../adminpanel/profile');
routes_admin.use('/profile', mdw_admin, profile);

var report = require('../adminpanel/report');
routes_admin.use('/report', mdw_admin, report);

var manage_config_setting = require('../adminpanel/manage_config_setting');
routes_admin.use('/manage_config_setting', mdw_admin, manage_config_setting);

var demo = require('../adminpanel/demo');
routes_admin.use('/demo', mdw_admin, demo);

module.exports = routes_admin;