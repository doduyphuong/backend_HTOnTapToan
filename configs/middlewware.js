var express = require("express");
var middleware = express;
var nJwt = require("njwt");

//middleware auth
middleware.mdw_auth = async function(req, res, next) {
  // post token
  var payload;
  // console.log(JSON.stringify(req.headers));
  try {
    var token = req.headers.token.toString();
    var token = token.split(".");
    // // Decode lay payload
    var buff = new Buffer(token[1], "base64");
    payload = JSON.parse(buff.toString("ascii"));
  } catch (e) {
    console.log(e);
    return res.send({
      status: -999,
      data: {
        message: "Invalid token"
      }
    });
  }

  //Check token
  var verifiedJwt;
  var signingKey = config.app.secretKey;
  try {
    var token = req.headers.token.toString();
    verifiedJwt = nJwt.verify(token, signingKey);
    req.user = verifiedJwt.body;
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
};

module.exports = middleware;
