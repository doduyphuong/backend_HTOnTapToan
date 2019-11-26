var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Manage_user_and_group_schema = new Schema({
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
    id_user: {
        type : String,
        required : true        
    },
    id_group: {
        type : String,
        required : true        
    },
    group_name :{
        type : String,
        required : true
    }  
},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

module.exports = mongoose.model('Manage_user_and_group', Manage_user_and_group_schema, "manage_user_and_group"); // model name, schema name, collection name 