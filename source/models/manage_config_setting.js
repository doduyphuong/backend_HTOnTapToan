var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Manage_config_setting_schema = new Schema({
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
    key: {
        type : String,
        unique : true,
        required : true,        
        lowercase : true
    },
    value: {
        type : String,        
        required : true
    },
    status : {
        type : Number,
        required : true,
        default : 0
    }
},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

module.exports = mongoose.model('Manage_config_setting', Manage_config_setting_schema, "manage_config_setting"); // model name, schema name, collection name 