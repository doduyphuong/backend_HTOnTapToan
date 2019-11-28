var express = require('express');
var zalo_lib = express;
var request = require('request');
var path = require('path');
var querystring = require('querystring');
const JSONbig = require('json-bigint')
const JSONstrict = require('json-bigint')({
	"strict": true
})
const JSONbigString = require('json-bigint')({
	"storeAsString": true
})


//app config
var appId = config.zaloapp.appid;
var secretKey = config.zaloapp.secretkey;
var oasecret = config.zaloapp.oasecret;

//onbehalf
var apiOnbehalf = 'https://openapi.zaloapp.com/v2.0/oa/';

zalo_lib.compare_mac = function (data, mac) {
    
    if (typeof data === 'object' && Object.keys(data).length > 0) {
        let str = appId + JSON.stringify(data) + querystring.escape(data.timestamp) + oasecret;
        var string_hash = helpers.hash_helper.sha256(str);
        if (mac != string_hash) {
            return false;
        }
        return true;
    }
    return false;
};

zalo_lib.getOaInfo = async function (req, res, accessTok) {
    try {
        var action = 'getoa';
        var apiUrl = apiOnbehalf + action;      

        var query_string = 'access_token=' +  encodeURIComponent(accessTok);
        var result = await helpers.service_helper.http_request_api(req, res,  apiUrl + '?' + query_string)
        //console.log(result);
        return result;
    }
    catch (err) {   
        console.log(err.message);    
        return null;
    }
}

zalo_lib.getProfileUser = async function (req, res, user_id, access_token) {
    try {
        var action = 'getprofile';
        var apiUrl = apiOnbehalf + action;

        var data = {
            user_id: user_id
        };

        data = JSON.stringify(data);     
        var query_string = "access_token=" + encodeURI(access_token) + "&data=" + encodeURIComponent(data);
        

        var result = await helpers.service_helper.http_request_api(req, res,  apiUrl + '?' + query_string)
        
        return result;
    }
    catch (err) {   
        console.log(err.message);    
        return null;
    }
}

zalo_lib.getListFollower = async function (req, res, access_token, offset, count) {
    try {
        var action = 'getfollowers';
        var apiUrl = apiOnbehalf + action;      

        var data = {
            offset : offset,
            count : count
        };
        data = JSON.stringify(data);

        var query_string = 'access_token=' +  encodeURIComponent(access_token) + "&data=" + encodeURIComponent(data);    
        var result = await helpers.service_helper.http_request_api(req, res,  apiUrl + '?' + query_string);a    
        
        return result;
    }
    catch (err) {   
        console.log(err.message);    
        return null;
    }
}



function escapedStringify(s, emit_unicode) {
    try {
        var json = JSON.stringify(s);
        return emit_unicode ? json : json.replace(/\//g,
            function (c) {
                return '\\/';
            }
        ).replace(/[\u003c\u003e]/g,
            function (c) {
                return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4).toUpperCase();
            }
        ).replace(/[\u007f-\uffff]/g,
            function (c) {
                return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
            }
        );
    } catch (e) {
        systemLog.writeException({ exception: e.message }, 'error', 'escapedStringify');
        return console.log(e);
    }
};

zalo_lib.sendActionMessage = async function (req, res, access_token, data_message, zalo_id) {
    try {
        var action = 'message';
        var apiUrl = apiOnbehalf + action;      

        var data = {
            recipient : {
                user_id: zalo_id
            },
            message : {                
                attachment: {
                    type : 'template',
                    payload : {
                        template_type : 'list',
                        elements : data_message
                    }                    
                }
            }
        };
        data = JSON.stringify(data);

        var query_string = 'access_token=' +  encodeURIComponent(access_token);    
        var result = await helpers.service_helper.http_request_post_api(req, res,  apiUrl + '?' + query_string, data);
        
        return result;
    }
    catch (err) {   
        console.log(err.message);    
        return null;
    }
}

zalo_lib.sendTextMessage = async function (req, res, access_token, message, zalo_id) {
    try {
        var action = 'message';
        var apiUrl = apiOnbehalf + action;

        var data = {
            recipient : {
                user_id : zalo_id
            },
            message : {
                text : message
            }
        };
        data = JSON.stringify(data);

        var query_string = 'access_token=' + encodeURIComponent(access_token);
        var result = await helpers.service_helper.http_request_post_api(null, null, apiUrl + '?' + query_string, data);
        return result;
    } catch (e) {
        // systemLog.writeException({exception: e.message}, 'error', 'sendLinksMessageToUID');
        console.log(e);
        return null;
    }
};

module.exports = zalo_lib;