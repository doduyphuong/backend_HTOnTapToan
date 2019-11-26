var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// Define User Schema
var Manage_permission_user_schema = new Schema({
    created: {
        type: String,
        required: true,
        lowercase: true
    },
    modified: {
        type: String,
        required: true,
        lowercase: true
    },
    username: {
        type : String,
        required : true        
    },
    module: {
        type : String,
        required : true
    },  
    permission_value: {
        type : Number,
        required : true
    }
},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

module.exports = mongoose.model('Manage_permission_user', Manage_permission_user_schema, "manage_permission_user"); // model name, schema name, collection name 