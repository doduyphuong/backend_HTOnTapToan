var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// Define User Schema
var Manage_module_schema = new Schema({
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
    name: {
        type : String,
        required : true,
        unique : true,
        lowercase: true
    },
    description: {
        type : String
    },  
    is_backend_menu:{
        type : Number,
        required : true,
        default : 0
    },
    backend_menu_weight: {
        type : Number,
        required : true,
        default : 0
    },
    status: {
        type : Number,
        required : true,
        default : 1
    }
},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

module.exports = mongoose.model('Manage_module', Manage_module_schema, "manage_module"); // model name, schema name, collection name 