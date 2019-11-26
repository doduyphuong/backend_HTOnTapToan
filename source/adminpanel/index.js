var express = require('express');
var index = express.Router();
var bcrypt = require('bcrypt');
var db = require('./../models');
var bols = require('./../model_bols');
var path = require('path');
var fs = require('fs');

//Khởi tạo data
index.get('/init', async function(req, res) { 
  var data = {
    have_root : 1 
  };

  let find_role = await bols.My_model.find('Manage_role', {is_root : 1}, '', 1);
  if(find_role.length > 0)
  {
    let id_role = find_role[0]._id;   
    let find_user = await bols.My_model.find('Manage_user', {id_role : id_role}); 
    if(find_user.length > 0)
    {
      data.have_root = 1;  
    }
    else{
      data.have_root = 0;
    }
  }
  else{
    data.have_root = 0;
  }


  res.render('adminpanel/init', data);
});

index.post('/init', async function(req, res) { 
  
  var data = {
    have_root : 0
  };

  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password must be 8 characters or longer, at least 1 lowercase, at least 1 uppercase, at least 1 numeric and 1 special character').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/, "i").withMessage('Password must be 8 characters or longer, at least 1 lowercase, at least 1 uppercase, at least 1 numeric and 1 special character');
  req.checkBody('email', 'Email is invalid').isEmail();
  req.checkBody('phone', 'Phone is not a valid phone number').matches(/^[\d]{8,11}$/, "i").withMessage('Phone is not a valid phone number!');
  req.checkBody('fullname', 'Fullname is required').notEmpty();

  var errors = req.validationErrors();
  if(errors){
    req.flash('message_error', helpers.helper.validator_error_message(errors));      
  }
  else{
    var id_role = null;
    //tạo role root
    let find_role = await bols.My_model.find('Manage_role', {is_root : 1}, '', 1);  
    if(find_role.length > 0)
    {
      id_role = find_role[0]._id;
    }
    else{
      let roleCreate = {
        name : 'root',     
        created : 'auto',
        modified : 'auto',
        is_root : 1,
        is_admin : 1
      }  
        
      //Chưa có role nào có quyền root thì cho tạo role có quyền root
      let newItem = await bols.My_model.create(req, 'Manage_role', roleCreate);
      if(newItem.status == 200){
        id_role = newItem.data._id;   
      }           
    }

    if(id_role != null){

      //tạo user quyền root
      let dataCreate = {
        id_role : id_role,
        permission_type : 'default',
        username : req.body.username,
        password : req.body.password + config.app.secretKey,
        email : req.body.email,
        phone : req.body.phone,
        fullname : req.body.fullname,     
        created : 'auto',
        modified : 'auto',
        ip : helpers.helper.get_client_ip(req)
      }

      let newItem = await bols.My_model.create(req, 'Manage_user', dataCreate);
      if(newItem.status == 200){
        data.have_root = 1;   

        //tạo nhóm admin default
        let roleCreate = {
          name : 'admin',     
          created : 'auto',
          modified : 'auto',
          is_root : 0,
          is_admin : 1
        }

        let newItem = await bols.My_model.create(req, 'Manage_role', roleCreate);

        //Khởi tạo module từ source----------------------------------------->
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
      
            let newItem = await bols.My_model.create(req, 'Manage_module', dataCreate);           
        });
      }
      else{
        data.have_root = 0;
        req.flash('message_error', newItem.data);      
      }
    }
    else{
      data.have_root = 0;
      req.flash('message_error', 'System error');  
    }   
  }  

  res.render('adminpanel/init', data);
});



/* GET home page admin. */
index.get('/', async function(req, res) {  
  
  //hard code function index
  res.locals.adminControllerIndex = '/adminpanel/';      
  res.locals.adminController = 'index';
  res.locals.adminAction = '';  
 
  var is_authenticated = await helpers.auth_helper.is_authenticated(req);  
  if(is_authenticated == true)
  {
      var user_data = await helpers.auth_helper.get_userdata(req);      

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
    return helpers.helper.redirect(res, '/adminpanel/login');             
  }

  res.render('adminpanel/index');
});

//Đăng nhập admin
index.get('/login', async function(req, res, next) {  
  if(await helpers.auth_helper.is_authenticated(req)){
    return helpers.helper.redirect(res, '/adminpanel/');
  }
  res.render('adminpanel/login');
});

//Đăng nhập admin
index.post('/login', async function(req, res) {

  //reCaptcha
  let captcha = await helpers.service_helper.call_recaptcha_api(req, res); 
  //console.log(captcha);
  if(captcha.success){
    if(captcha.success == true)
    {
      
      req.checkBody('username', 'Vui lòng nhập tài khoản').notEmpty();    
      req.checkBody('password', 'Vui lòng nhập mật khẩu').notEmpty();
      
      var errors = req.validationErrors();

      if(errors){
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));      
      }
      else{    
        let user = await helpers.auth_helper.verify_user(req.body.username, req.body.password);
        if(user != null)
        {      
          if(user.status == 1){
            let data_logged = {
              _id : user._id,
              id_role : user.id_role,
              username : user.username,
              email : user.email,
              phone : user.phone,
              fullname : user.fullname,
              is_admin : user.is_admin, //check quyền admin
              is_root : 0         
            };

            //set data login vào session
            req.session.userdata = data_logged;    

            //set quyền vào session
            req.session.permission = {};//cố tình gán rỗng
            req.session.save();
            helpers.per_helper.auth_permission(req, data_logged);  

            //quay về trang trước
            if(req.query.returnUrl != undefined && req.query.returnUrl != '' && req.query.returnUrl != null){
              return helpers.helper.redirect(res, req.query.returnUrl);
            }
            else{
              return helpers.helper.redirect(res, '/adminpanel/');
            }
          }
          else{
            req.flash('message_error', 'Your account disabled !!!');    
          }
        }
        else{
          //console.log(errors);
          req.flash('message_error', 'Username or Password invalid !!!');  
        }
      }//validate error
    }//captcha
    else{
      req.flash('message_error', 'Please confirm you are not a robot');    
    }
  }
  else{
    req.flash('message_error', 'Please confirm you are not a robot');  
  }  

  res.render('adminpanel/login');
});


index.get('/error/:code', async function(req, res){
  let message = 'System error';
  let code = req.params.code;
  if(code == 401){
    message = 'Your access denied';
  }else if(code == 101){
    message = 'Your permission denied';
  }else if(code == 701){
    message = 'Missing data, please check your data';
  }else if(code == 403){
    message = 'Execute access forbidden';
  }

  data = {
    code : code,
    message : message
  };
  res.render('errors/error', data);
});

//thoát admin
index.get('/logout', async function(req, res){
  let logout = await helpers.auth_helper.delete_userdata(req);
  return helpers.helper.redirect(res, '/adminpanel/login');
});

index.get('/renew-session', async function(req,res){
  let user_data = await helpers.auth_helper.get_userdata(req);
  if(user_data){
    //set quyền vào session
    helpers.per_helper.auth_permission(req, user_data);  
    return helpers.helper.redirect(res, '/adminpanel/');
  }
  else{
    return helpers.helper.redirect(res, '/adminpanel/login');
  }    
});

index.get('/test', async function(req, res){
  var list = [{name:'a'}, {name : 'b'}];
  for(let i = 0;i< list.length;i++)
  {
    list[i].value = await helpers.per_helper.get_full_permission_value();
  } 
  console.log(list);

  res.send('done');
});

module.exports = index;