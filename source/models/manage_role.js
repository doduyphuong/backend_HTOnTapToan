var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Manage_role_schema = new Schema({
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
        lowercase : true
    },
    is_admin:{
        type : Number,
        required : true,
        default : 0
    },
    is_root : {
        type : Number,
        required : true,
        default: 0
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

module.exports = mongoose.model('Manage_role', Manage_role_schema, "manage_role"); // model name, schema name, collection name 