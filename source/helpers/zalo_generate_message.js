var express = require('express');
var zalo_generate_messsage = {};
var request = require('request');
var path = require('path');
const JSONbig = require('json-bigint')
const JSONstrict = require('json-bigint')({
	"strict": true
})
const JSONbigString = require('json-bigint')({
	"storeAsString": true
})


zalo_generate_messsage.g_action_template = async function (id, message_content) {
    var result = [];

    //lấy thông tin message lưu cache
    var key_redis = 'message_content_' + id;
    var g = await helpers.redis_helper.get(key_redis);
    if(g == null)
    {
        try {
            for(var i = 0;i< message_content.length;i++)
            {
                //gán action hoặc link
                var default_action = {};
                if(message_content[i].type == 'link')
                {
                    default_action.type = 'oa.open.url';
                    default_action.url = message_content[i].data;
                }
                else{
                    default_action.type = 'oa.query.show';
                    default_action.payload = message_content[i].data;
                }
    
                //tạo item message theo json OA
                var item = {
                    title : message_content[i].title,
                    subtitle : message_content[i].description,
                    image_url :  message_content[i].image,
                    default_action : default_action
                };
                result.push(item);
            }      

            //set cache content message
            helpers.redis_helper.set(key_redis, JSON.stringify(result));
        }
        catch (err) {   
            console.log(err.message);
        }
    }
    else{
        result = g;
    } 
      
    //trả ra data    
    return result;
}


module.exports = zalo_generate_messsage;