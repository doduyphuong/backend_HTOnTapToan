var express = require('express');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('express-flash');
var validator = require('express-validator');
var helmet = require('helmet');
var csrf = require('csurf');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const redisStore = require('connect-redis')(session);
var env = 'dev';//production, dev

var app = express();

// view engine setup
app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json({
  limit: '30mb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '30mb'
}));
app.use(cookieParser());



//init root folder
global.__base = __dirname + '/';


//config && cors
if(env != 'production'){
  global.config = require('./configs/configdev');  
  cors();  
}
else{  
  global.config = require('./configs/config');  
}

//cors
var whitelist_domain = config.cors.whitelist;
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(whitelist_domain));


//helpers
global.helpers = require('./helpers');

//locals config
app.locals.appName = config.app.appName;

//frontend meta
app.locals.pageTitle = 'Quản lý khách hàng trên Zalo';
app.locals.pageDes = 'Zalo luôn lắng nghe yêu thương';
app.locals.pageImage = 'https://stc.adtima.vn/media/images/fbshare_cover.jpg';

//backend meta
app.locals.pageAdminTitle = 'Quản trị CRM Zalo';
app.locals.pageAdminDes = 'Zalo luôn lắng nghe yêu thương';
app.locals.pageAdminImage = 'https://stc.adtima.vn/media/images/fbshare_cover.jpg';

//Biến static và baseurl cho trường hợp refix
global.__baseUrl = ''
global.__staticUrl = '';
app.locals.baseUrl = config.app.baseUrl;
__baseUrl = config.app.baseUrl;
app.locals.staticUrl = config.app.staticUrl;
__staticUrl = config.app.staticUrl;

//global evn
global.__env = env;

// session middleware
if(config.app.sessionRedis == false)
{
  app.use(session({
    secret: config.app.sessionKey, //key session
    resave: true,
    saveUninitialized: true,
    name : 'adtima_s',
    cookie: {
      path: '/',
      secure: false,
      maxAge: 3600000
    } //60 phút
  }));
}
else{
  try{
    var redis   = require("redis");
    var client  = redis.createClient();
    app.use(session({  
      secret: config.app.sessionKey, //key session
      store: new redisStore({ host: config.redis.host, port: config.redis.port, client: client, ttl :  260}),
      resave: true,
      saveUninitialized: true,
      name : 'adtima_s',    
      cookie: {
        path: '/',
        secure: false,
        maxAge: 3600000
      } //60 phút
    }));
  }
  catch(ex){
    console.log(ex);
  } 
}


//flash
app.use(flash());

//validator
app.use(validator());

//helmet
app.use(helmet());
app.use(helmet.xssFilter());

//token
var csrfProtection = csrf({
  cookie: true
});
app.use(csrf());


//handle csrf error
app.use(function (err, req, res, next) {
  //nếu post vào đầu callback thì bỏ qua csrf
  if (req.path == __baseUrl + '/callback/zalo-oa-event') return next();
  
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  // handle CSRF token errors here
  res.status(403);
  res.send('Execute access forbidden (csrf invalid)');
})


//middleware token
app.use(function (req, res, next) {
  var token = req.csrfToken();
  res.cookie('CSRF-TOKEN', token);
  res.locals.csrftoken = token;
  next();
});



//fileUpload
app.use(fileUpload({limits: { fileSize: 6 * 1024 * 1024 }})); //6MB


//app middleware tổng của app
var mdw_app = (function (req, res, next) {  

  app.locals.scriptGlobal = '<script>var baseUrl="' + __baseUrl + '";var staticUrl="' + __staticUrl + '";</script>';
  //recaptcha
  res.locals.recaptcha = {
    sitekey: config.recaptcha.sitekey,
    secretkey: config.recaptcha.secretkey,
  };

  res.locals.zaloapp = {
    appid : config.zaloapp.appid
  }


  //Get & Post para,
  res.locals.appPostParam = req.body;
  res.locals.appGetParam = req.query;

  //login url
  res.locals.zalo_auth_url = "https://oauth.zaloapp.com/v3/auth?app_id=" + res.locals.zaloapp.appid  +"&redirect_uri=" + encodeURI(config.zaloapp.callback)  + "&state=" + encodeURI('/');
  next();
});


app.use(__baseUrl + '/public', express.static(path.join(__dirname, 'public')));
app.use(__baseUrl + '/medias', express.static(path.join(__dirname, 'medias')));


//route
var indexRouter = require('./configs/routes');
app.use(__baseUrl + '/', mdw_app, indexRouter);

//route
var adminRouter = require('./configs/routes_admin');
app.use(__baseUrl + '/adminpanel', mdw_app, adminRouter);

//route
var openApiRouter = require('./configs/routes_openapi');
app.use(__baseUrl + '/openapi', mdw_app, openApiRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {  
  helpers.helper.show_404(res);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//port
app.listen(config.app.port);

module.exports = app;