var express = require('express');
var redis_helper = express;
var request = require('request');
var fs = require("fs");
var bols = require('../model_bols');
var redis = require('redis');
let redisHost = config.redis.host;
let redisPort = config.redis.port;
var publisher = redis.createClient(redisPort, redisHost);
// var subscriber = redis.createClient(redisPort, redisHost);
// [ {client : <client>, room: room}, ... ]
var list_client_connect = [];

const JSONbig = require('json-bigint')
const JSONstrict = require('json-bigint')({
    "strict": true
})
const JSONbigString = require('json-bigint')({
    "storeAsString": true
})


redis_helper.set = function (key, data, time = 86400) {
    try {
        var redisClient = redis.createClient(redisPort, redisHost);
        redisClient.on('ready', function (err, response) {
            redisClient.del(key, function (err, response) {
                if (err) {
                    console.log(err.message);
                }
                else {
                    redisClient.set(key, data);
                    redisClient.expire(key, time);
                }

                redisClient.quit();
            });
        });

        redisClient.on('error', function (err, response) {
            redisClient.quit();
        });
    }
    catch (err) {

    }
}

redis_helper.setAwait = async function (key, data, time = 86400) {
    return new Promise(function (resolve, reject) {
        try {
            var redisClient = redis.createClient(redisPort, redisHost);
            redisClient.on('ready', function (err, response) {
                redisClient.del(key, function (err, response) {
                    if (err) {
                        console.log(err.message);
                    }
                    else {
                        redisClient.set(key, data);
                        redisClient.expire(key, time);
                    }

                    redisClient.quit();
                    resolve(null);
                });
            });

            redisClient.on('error', function (err, response) {
                redisClient.quit();
                resolve(null);
            });
        }
        catch (err) {
            resolve(null);
        }
    });
}

redis_helper.delete = function (key) {
    try {
        var redisClient = redis.createClient(redisPort, redisHost);
        redisClient.on('ready', function (err, response) {
            redisClient.del(key, function (err, response) {
                if (err) {
                }
                else {

                }

                redisClient.quit();
            });
        });

        redisClient.on('error', function (err, response) {
            redisClient.quit();
        });
    }
    catch (err) {
    }
}

redis_helper.get = async function (key) {
    return new Promise(function (resolve, reject) {
        try {
            var redisClient = redis.createClient(redisPort, redisHost);
            redisClient.on('ready', function (err, response) {
                redisClient.get(key, function (err, reply) {
                    redisClient.quit();

                    if (reply != null) {
                        var r = '';
                        try {
                            r = JSONbig.parse(reply)
                        }
                        catch (e) {
                            r = reply;
                        }

                        resolve(r);
                    } else {
                        resolve(null);
                    }  
                });
            });

            redisClient.on('error', function (err, response) {
                redisClient.quit();
                resolve(null);
            });
        }
        catch (err) {
            resolve(null);
        }
    });
}

// Tạo 1 channel theo key truyền vào
// Function sẽ thực hiện việc publish sự thay đổi của channel đó
redis_helper.create_publish_redis = function (key_data, msg_data) {
    try {
        // console.log('channel_' + key_data);
        publisher.publish('channel_' + key_data, msg_data, function () { });

    } catch (error) {

    }

}

// Tạo 1 channel theo key truyền vào.
// Function: 
// 1. Sẽ thực hiện việc subscriber lắng nghe theo channel vừa tạo.
// 2. Bắt tất cả những sự thay đổi trên kênh channel
redis_helper.create_subscribe_redis = async function (room, io, ns, type='message') {
    try {
        
        var check_client = await check_client_room(room);
        if (check_client == false) {
            var subscriber = redis.createClient(redisPort, redisHost);
            if (type !== 'message') {
                // notify
                subscriber.on("message", function (channel, message) {
                    // console.log("Message notify: " + message + " on channel: " + channel + " is arrive!");
                    let msg = JSON.parse(message);
                    let data = {
                        list: JSON.parse(msg.list),
                        miss_msg: msg.miss_msg
                    }
                    io.sockets.in(room).emit('notifyUpdate', data);
                });
                subscriber.subscribe('channel_' + room);
            } else {
                // message OA- User
                subscriber.on("message", function (channel, message) {
                    // console.log("Message: " + message + " on channel: " + channel + " is arrive!");
                    io.of(ns).in(room).emit('responseInputMessage', JSON.parse(message));
                });
                subscriber.subscribe('channel_' + room);
            }

            list_client_connect.push({ client: subscriber, room: room });
            // console.log('-------1-------')
            // console.log(list_client_connect);
            // console.log('-------1-------')
        }
    } catch (error) {

    }

}

// Ngắt kết nối subcribe của 1 channel 
redis_helper.disconnect_subscribe_redis = function (room) {
    try {
        if (list_client_connect.length > 0) {
            list_client_connect.forEach(function (item, index) {
                // console.log(item.room);
                // console.log(room);
                if (item.room == room) {
                    // console.log('disconnect_channel_' + room);
                    item.client.unsubscribe();
                    item.client.quit();
                    list_client_connect.splice(index, 1);
                }
            });
            // console.log('--------2------')
            // console.log(list_client_connect);
            // console.log('--------2------')
        }
    } catch (error) {

    }
}

// Ghi log danh sách tin nhắn giữa OA và User
redis_helper.write_log_conversation = function (req, sign) {
    try {
        var redisClient = redis.createClient(redisPort, redisHost);

        // Lấy danh sách key trong redis theo một dạng nhất định
        redisClient.keys(sign, async function (err, keys) {
            if (err) return console.log(err);

            if (keys) {
                // lấy data redis write vào file
                keys.forEach(async function (key) {
                    // xử lý path file
                    var tmp = key;
                    var arr_tmp = tmp.split('_');
                    // call init folder
                    var path_folder = await helpers.write_file_helper.init_file_name('crm_log_message', arr_tmp[3]);
                    // path_file = path_folder;
                    path_folder += '/' + key + '.txt';

                    var data = await helpers.redis_helper.get(key);
                    let total_message = data.length;

                    // Mã hóa theo chuẩn AES
                    data = JSON.stringify(data);
                    data = helpers.hash_helper.aes_encrypt(data, config.app.secretKey);
                    
                    // Ghi data vào file txt
                    fs.writeFile(path_folder, data, async (err) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Successfully Written to File " + key + ".txt");
                            var oa_id = arr_tmp[3];
                            var zalo_id_by_oa = arr_tmp[4];

                            var key_data = await helpers.conversation_helper.conversation_key(oa_id, zalo_id_by_oa);
                            var document_file_oa = await bols.My_model.find_first('Crm_conversation', { key_data: key_data });

                            var d = new Date();
                            var dd = d.getDate();
                            var mm = parseInt(d.getMonth()) + 1;
                            if(mm < 10) {
                                mm = '0'+mm;
                            }
                            if(dd < 10) {
                                dd = '0'+dd;
                            }
                            var yyyy = d.getFullYear();
                            var date = yyyy + '/' + mm + '/' + dd;
                            let _path = path_folder.substr(0,path_folder.search('crm_log_message')) + 'crm_log_message/';
                            // Chưa có trong data tạo mới
                            if (document_file_oa == null) {
                                var oa = await bols.My_model.find_first('Crm_oa_info', { oa_id: oa_id });
                                var audience = await bols.My_model.find_first('Crm_zalo_audience', { zalo_id_by_oa: zalo_id_by_oa });
                                if (oa && audience) {
                                    var data = {
                                        key_data: key_data,
                                        oa_id: oa.oa_id,
                                        oa_name: oa.oa_name,
                                        zalo_id_by_oa: zalo_id_by_oa,
                                        zalo_name: audience.zalo_name,
                                        data_conversation: []
                                    }
                                    
                                    var data_conversation = {
                                        date: date,
                                        hour: d.getHours() - 1,
                                        total_message: total_message,
                                        file_name: key,
                                        path: _path
                                    }

                                    data.data_conversation.push(data_conversation);

                                    var i = await bols.My_model.create(req, 'Crm_conversation', data);
                                    if (i.status == 200) {
                                        console.log('---------Create Success---------');
                                    }
                                }
                            } else {
                                var data_conversation = {
                                    date: date,
                                    hour: d.getHours() - 1,
                                    total_message: total_message,
                                    file_name: key,
                                    path: _path
                                }

                                document_file_oa.data_conversation.push(data_conversation);

                                var data = {
                                    data_conversation: document_file_oa.data_conversation
                                }

                                var i = await bols.My_model.update(req, 'Crm_conversation', { key_data: key_data }, data);
                                if (i.status == 200) {
                                    console.log('---------Update Success---------');
                                }
                            }
                        }
                    });
                });
            }
        });

        redisClient.on('error', function (err, response) {
            redisClient.quit();
        });

        return arr_key;
    } catch (error) {

    }
}

async function check_client_room(room) {
    try {
        if (list_client_connect.length > 0) {
            list_client_connect.forEach(function (item, index) {
                // console.log(item, index);
                if (item.room == room)
                    return true;
            });
        }
        
        return false;
    } catch (error) {

    }
}

module.exports = redis_helper;