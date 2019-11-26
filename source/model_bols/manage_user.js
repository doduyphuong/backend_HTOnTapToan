var db = require('../models');
var bcrypt = require('bcrypt');
class Manage_user {       
    static async update_password(id, password) {
        try {            
            password = bcrypt.hashSync(password, 10);
            let update = await db.Manage_user.where({_id : id}).update({ password : password });           
            if (!update) {
              return {status: 500, data : update};
            } else {
                return {status: 200, data : update};
            }
        } catch (e) {
            console.log(e);
            return {status: e.code, data : e.message};
        }
    }
    
    static async find_by_username(username) {
        try {            
            let user = await db.Manage_user.findOne({ username : username});           
            
            return user;
        } catch (e) {
            console.log(e);
            return null;
        }
    } 
}

module.exports = Manage_user;