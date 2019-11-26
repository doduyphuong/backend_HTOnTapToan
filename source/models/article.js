var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Article_schema = new Schema({
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
        unique : true,
        default: 'Adtima001'
    },
    publish_date :{
        type : Date,
        default: ''
    },
    title :{
        type : String,
        default: ''
    },
    description :{
        type : String,
        default: ''
    },
    image :{
        type : String,
        default: ''
    },
    // same title
    image_alt :{
        type : String,
        default: ''
    },
    data_image :{
        type : String,
        default: ''
    },
    main_content :{
        type : String,
        default: ''
    },
    // 5 data : note_1, note_2, note_3, note_4, note_5
    data :{
        type : String,
        default: '{}'
    },
    // same title
    seo_title :{
        type : String,
        default: ''
    },
    // same description
    seo_description :{
        type : String,
        default: ''
    },
    seo_keyword :{
        type : String,
        default: ''
    },
    // same slug(title)
    slug :{
        type : String,
        default: ''
    },
    // view
    count_view :{
        type : String,
        default : 0
    },
    // like
    count_like :{
        type : String,
        default : 0
    },
    // 0: Inactive, 1: Active
    status :{
        type : Number,
        required : true,
        default : 0
    },
    // 0: False, 1: True
    is_hot :{
        type : Number,
        required : true,
        default : 0
    },
    oa_id :{
        type : String,
        required : true,
        default : 'internal'
    },
    oa_name :{
        type : String,
        required : true,
        default : 'internal'
    }
},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

module.exports = mongoose.model('Article', Article_schema, "article"); // model name, schema name, collection name 