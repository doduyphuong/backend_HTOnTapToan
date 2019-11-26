var express = require('express');
var data_helper = {};
var db = require('./../models');
var bols = require('./../model_bols');
var moment = require('moment');

/**
 * @api {function} get_manage_role_name Lấy role name
 * @apiName get_userdata
 * @apiDescription Lấy tên của role để show ra view
 * @apiGroup data_helper
 * @apiVersion 1.0.0
 * @apiParam {String} id Thông tin _id của role.
 *
 */

data_helper.get_manage_role_name = async function(id){
    var item = null;
    if(id != undefined){
        item = await bols.My_model.findById('Manage_role', id);        
    }  

    if(item == null){
        return '';
    }  
    else{
        //console.log(item.name);
        return item.name;
    }       
}


module.exports = data_helper;