var express = require('express');
var redis_helper = {};
var request = require('request');
var redis = require('redis');

let redisHost = config.redis.host;
let redisPort = config.redis.port;
const JSONbig = require('json-bigint')
const JSONstrict = require('json-bigint')({
	"strict": true
})
const JSONbigString = require('json-bigint')({
	"storeAsString": true
})


redis_helper.set = function(key, data, time = 86400){   
    try{
        var redisClient = redis.createClient(redisPort, redisHost);
        redisClient.on('ready', function(err, response){
            redisClient.del(key, function(err, response){
                if(err)
                {
                    console.log(err.message);
                }  
                else{
                    redisClient.set(key, data);
                    redisClient.expire(key, time);
                } 
                
                redisClient.quit();
            }); 
        });

        redisClient.on('error', function(err, response){
            redisClient.quit();
        });
    }   
    catch(err)
    {

    }
}


redis_helper.delete = function(key){   
    try{    
        var redisClient = redis.createClient(redisPort, redisHost);
        redisClient.on('ready', function(err, response){
            redisClient.del(key, function(err, response){
                if(err)
                {                
                }
                else{      
                                
                }  
                
                redisClient.quit();                
            }); 
        }); 
        
        redisClient.on('error', function(err, response){
            redisClient.quit();
        });
    }   
    catch(err)
    {
    }
}

redis_helper.get = async function(key){
    return new Promise(function (resolve, reject) { 
        try{
            var redisClient = redis.createClient(redisPort, redisHost);
            redisClient.on('ready', function(err, response){
                redisClient.get(key, function(err, reply) {        
                    try{
                        redisClient.quit();           
                        resolve(JSONbig.parse(reply));
                    } catch(e){
                        redisClient.quit(); 
                        resolve(reply);
                    }                                               
                }); 
            }); 
    
            redisClient.on('error', function(err, response){       
                redisClient.quit(); 
                resolve(null);
            });
        }  
        catch(err)
        {
            resolve(null);
        }
    });    
}


module.exports = redis_helper;