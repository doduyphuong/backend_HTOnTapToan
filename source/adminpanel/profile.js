var express = require('express');
var profile = express.Router();
var bcrypt = require('bcrypt');
var db = require('./../models');
var bols = require('./../model_bols');

profile.get('/', async function(req, res) { 
    var info = {};
    var selected_group_list = {};
    var user_current = await helpers.auth_helper.get_userdata(req);
    if(user_current){
        info = user_current;
        //nhóm
        selected_group_list = await bols.My_model.find_all('Manage_user_and_group', {'id_user' : user_current._id}, "id_group group_name");
    }

    var data = {
        info : info,
        scriptjs : '',
        selected_group_list : selected_group_list
    };
  
    res.render('adminpanel/profile/index', data);
});

profile.get('/changepassword', async function(req, res) { 
    var scriptjs = '';    
    var data = {
        scriptjs : scriptjs
    };  
    res.render('adminpanel/profile/changepassword', data);
});

profile.post('/changepassword', async function(req, res) { 
    var scriptjs = '';
    req.checkBody('oldpassword', 'Old password is required').notEmpty();
    req.checkBody('password', 'Password must be 8 characters or longer, at least 1 lowercase, at least 1 uppercase, at least 1 numeric and 1 special character').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/, "i").withMessage('Password must be 8 characters or longer, at least 1 lowercase, at least 1 uppercase, at least 1 numeric and 1 special character');
    req.checkBody('repassword', 'Re-password is required').notEmpty();

    var errors = req.validationErrors();
    if(errors){
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));      
    }
    else{
        var user_current = await helpers.auth_helper.get_userdata(req);
        
        var oldpassword = req.body.oldpassword;
        var password = req.body.password;
        var repassword = req.body.repassword;

        let verify = await helpers.auth_helper.verify_user(user_current.username, oldpassword);
        if(verify){
            if(password == repassword){
                password = password + config.app.secretKey;       
                let updateItem = await bols.Manage_user.update_password(user_current._id, password);
                if(updateItem.status == 200){
                    req.flash('message_success', 'Change pasword success');   
                    scriptjs = '<script>empty_all_fields();</script>';                        
                }
                else{
                    req.flash('message_error', updateItem.data);      
                }
            }
            else{
                req.flash('message_error', 'Re-password not match with password');          
            }
        }
        else{
            req.flash('message_error', 'Old password incorrect');      
        }

    }
    
    var data = {
        scriptjs : scriptjs
    };  
    res.render('adminpanel/profile/changepassword', data);
});

profile.get('/changeavatar', async function(req, res){
    var scriptjs = '';    
    var avatar = '';
    var user_current = await helpers.auth_helper.get_userdata(req);
    if(user_current)
    {
        var user_in_data = await bols.My_model.findById('Manage_user', user_current._id);
        avatar = user_in_data.avatar;
    }
    var data = {
        avatar : avatar,
        scriptjs : scriptjs
    };  
    res.render('adminpanel/profile/changeavatar', data);
});

profile.post('/changeavatar', async function(req, res){
    var scriptjs = '';    
    var avatar = '';
    
    req.checkBody('avatar', 'Avatar image is required').notEmpty().matches(/\.(jpeg|jpg|gif|png)$/, "i").withMessage('Avatar link invalid');
    
    var errors = req.validationErrors();
    if(errors){
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));      
    }
    else{
		if(helpers.helper.is_image(req.body.avatar))
        {         
			var user_current = await helpers.auth_helper.get_userdata(req);
			let update = await bols.My_model.update(req, 'Manage_user', {username : user_current.username}, {avatar : req.body.avatar});
			if(update.status == 200){
				req.flash('message_success', 'Change avatar success');
				avatar = req.body.avatar;
			}
			else{
				req.flash('message_error', update.message);
			}
		}
		else{
			req.flash('message_error', 'Data invalid');
		}

        //móc lại data cũ
        var user_in_data = await bols.My_model.findById('Manage_user', user_current._id);
        avatar = user_in_data.avatar;
    }
    

    
    var data = {
        avatar : avatar,
        scriptjs : scriptjs
    };  
    res.render('adminpanel/profile/changeavatar', data);
});

module.exports = profile;
