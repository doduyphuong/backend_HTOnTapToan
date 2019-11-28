var express = require('express');
var nJwt = require('njwt');
var routes_appapi = express.Router();

//middleware
var mdw_admin = (async function (req, res, next) {
    // post token
    var payload;

    try {
        var token = req.body.token.toString();
        var token = token.split(".");
        
        // Decode lay payload
        var buff = new Buffer(token[1], 'base64');
        payload = JSON.parse(buff.toString('ascii'));
    } catch (e) {
        console.log(e);
        return res.send({
            status: -999,
            data: {
                message: "Invalid token"
            }
        });
    }
    
    // Check token
    var verifiedJwt;
    var signingKey = config.app.secretKey;
    try {
        verifiedJwt = nJwt.verify(req.body.token, signingKey);
        req.body.verifiedJwt = verifiedJwt;
    } catch (e) {
        console.log(e);
        return res.send({
            status: -999,
            data: {
                message: "Invalid token"
            }
        });
    }
    next();
});

module.exports = routes_appapi;