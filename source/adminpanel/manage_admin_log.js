var express = require('express');
var manage_admin_log = express.Router();
var db = require('../models');
var bols = require('../model_bols');


// /* GET home page. */
manage_admin_log.get('/', async function(req, res) {
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);
  
  var filter = {};
  filter = helpers.helper.bind_data_filter(req);
 
  var data = {  
    start_page : 1,
    page_size : 15,
    model_name : 'Manage_admin_log',    
    search_fields : 'usename controller action',
    order : JSON.stringify({createdAt : 'desc'}),
    filter : JSON.stringify(filter),
    is_action : 0,
    action_list : ''
  };
  res.render('adminpanel/manage_admin_log/index', data);
});

//detail
manage_admin_log.get('/detail/:id', async function(req, res, next) {  
  //check quyền
  let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);

  var item = null;  
  let id = req.params.id;

  if(id != undefined){
    item = await bols.My_model.findById('Manage_admin_log', id);
    if(item == null){
      helpers.helper.show_404(res);  
    }
  } 
 

  var data = {
      item : item,
      out_fields : await bols.My_model.model_fields('Manage_admin_log'),
      returnUrl : helpers.admin_helper.get_returnUrl(req, res)
  };

  res.render('adminpanel/detail', data);
});

module.exports = manage_admin_log;