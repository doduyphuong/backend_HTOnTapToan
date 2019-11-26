var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Manage_admin_log_schema = new Schema({
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
    module: {
        type : String,
        required : true,        
        lowercase : true
    },
    action: {
        type : String,
        lowercase : true
    },
    param: {
        type : String       
    },
    href: {
        type : String,
        lowercase : true
    },
    ip: {
        type : String,
        lowercase : true
    }
},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

module.exports = mongoose.model('Manage_admin_log', Manage_admin_log_schema, "manage_admin_log"); // model name, schema name, collection name 