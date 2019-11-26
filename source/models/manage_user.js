var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// Define User Schema
var Manage_user_schema = new Schema({
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
    id_role: {
        type : String,
        required : true
    },  
    source: {
        type : String,
        required : true,
        default : 'internal'
    },  
    username: {
        type : String,
        required : true,
        unique : true,
        lowercase : true
    },  
    password: {
        type : String,
        require : true
    },  
    phone: {
        type : String,
        unique : true,
        required : true
        
        // validate: {
        //     isAsync: true,
        //     validator: function(v, cb) {
        //       setTimeout(function() {
        //         var phoneRegex = /\d{8,11}/;
        //         var msg = v + ' is not a valid phone number!';         
        //         cb(phoneRegex.test(v), msg);
        //       }, 3);
        //     },            
        //     message: 'Phone is invalid'
        // }
    },  
    email: {
        type : String,
        required : true,
        unique : true,
        lowercase : true
        // validate: {
        //     isAsync: true,
        //     validator: function(v, cb) {
        //       setTimeout(function() {
        //         var emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;                ;
        //         var msg = v + ' is not a valid email!';         
        //         cb(emailRegex.test(v), msg);
        //       }, 3);
        //     },            
        //     message: 'Email is invalid'
        // }
    },  
    fullname: {
        type : String,
        required : true
    },  
    gender: {
        type : Number
    },  
    dob: {
        type : Date
    },  
    address: {
        type : String
    },  
    province: {
        type : String
    },  
    district: {
        type : String
    },  
    ward: {
        type : String
    },  
    avatar: {
        type : String
    },  
    description: {
        type : String
    },  
    label: {
        type : String
    },  
    ip: {
        type : String
    },  
    status: {
        type : Number,
        required : true,
        default : 1
    },  
    is_actived: {
        type : Number,
        required : true,
        default : 0
    },
    permission_type : {
        type : String,
        required : true,
        default : "default"
    }                   

},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

//pre hook
Manage_user_schema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });   
});

module.exports = mongoose.model('Manage_user', Manage_user_schema, "manage_user"); // model name, schema name, collection name 