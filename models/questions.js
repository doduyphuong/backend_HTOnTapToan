var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Questions_schema = new Schema({
    name: {
        type: String,
        required: true
    },
    // Choses 1 in 4: 1, fill form: 2
    type: {
        type: Number,
        required: true
    },
    /*
    choose = [
            {
                _id,
                text
            },...
        ]
    */
    choose: {
        type: [Schema.Types.Mixed],
        required: true
    },
    // _id choose document
    result: {
        type: String,
        default: ''
    },
    examId: {
        type: String,
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

module.exports = mongoose.model('Questions', Questions_schema, "questions"); // model name, schema name, collection name 