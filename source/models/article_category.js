var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Article_category_schema = new Schema({
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
    },
    image :{
        type : String,
        required : true
    },
    parent_id :{
        type : Number,
    },
    status :{
        type : Number,
        required : true
    }
},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

module.exports = mongoose.model('Article_category', Article_category_schema, "article_category"); // model name, schema name, collection name 