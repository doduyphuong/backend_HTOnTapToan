var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Ranks_schema = new Schema({
    id_exam: {
        type : String,
        required : true
    },
    id_user :{
        type : String,
        required: true
    },
    score :{
        type : String,
        required: true
    },
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
},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

module.exports = mongoose.model('Ranks', Ranks_schema, "ranks"); // model name, schema name, collection name 