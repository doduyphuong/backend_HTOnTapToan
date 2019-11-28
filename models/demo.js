var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Demo_schema = new Schema({
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
    cate_id: {
        type : String,
        required : true,      
        default: 'Adtima001'
    },
    title :{
        type : String,
        default: ''
    },
    description :{
        type : String,
        default: ''
    }
},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

module.exports = mongoose.model('Demo', Demo_schema, "demo"); // model name, schema name, collection name 