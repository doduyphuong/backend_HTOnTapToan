var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define User Schema
var Manage_module_field_schema = new Schema({
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
        required : true
    },
    username: {
        type : String,
        required : true,        
        lowercase: true
    },  
    fields: {
        type : String,
        required : true
    }
},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

module.exports = mongoose.model('Manage_module_field', Manage_module_field_schema, "manage_module_field"); // model name, schema name, collection name 