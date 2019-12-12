var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// Define Schema
var Users_schema = new Schema({
    username: {
        type : String,
        required : true
    },
    password :{
        type : String,
        required: true
    },
    name :{
        type : String,
        required: true
    },
    phone :{
        type : String,
        required: true
    },
    email :{
        type : String,
        default: ''
    },
    district :{
        type : String,
        default: ''
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

//pre hook
Users_schema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });   
});

module.exports = mongoose.model('Users', Users_schema, "users"); // model name, schema name, collection name 