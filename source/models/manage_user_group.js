var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define User Schema
var Manage_user_group_schema = new Schema({
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
        unique: true 
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

module.exports = mongoose.model('Manage_user_group', Manage_user_group_schema, "manage_user_group"); // model name, schema name, collection name 