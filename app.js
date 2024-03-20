var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');
var session = require('express-session');
const passport = require('passport');
const rfs = require('rotating-file-stream');
const fs = require('fs');
// Package documentation - https://www.npmjs.com/package/connect-mongo
const MongoStore = require('connect-mongo');
const fileUpload = require('express-fileupload');
const flash = require('connect-flash');


// external libarary
const ENVCHECK = require('./configuration/ENVCHECK.js');
const RESPONSE = require('./configuration/RESPONSE.js'); //common responsae 
const mailed = require('./configuration/MAIL.js');
const HELPER = require('./configuration/HELPER.js');
var DB = require('./mongo/mongooseHelper.js')(); // DB connection
const jwtCheck = require('./configuration/jwtCheck.js');
const { verifyMailService } = require('./helper/helper.js');
verifyMailService(); //check mail service
// external libarary


// require('dotenv').config()
setTimeout(async () => {
  if (false) {
    // await userModel.deleteMany({});
    const { faker } = require('@faker-js/faker');
    for (let index = 0; index < 32; index++) {
      let user = await userModel.create(
        {
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          email: faker.internet.email(),
          password: '123456',
          role: '1',
        }
      );
    }
  }
}, 2000);



var app = express();
app.use(cors());

if (true) {
  /* ------- for http logging -------*/
  let logDirectory = path.join('./', 'httplog')

  // ensure log directory exists
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

  // create a rotating write stream
  let accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
  });

  // setup the logger
  app.use(logger('dev', { stream: accessLogStream }));
  // let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
  /* ------- end of for http logging -------*/
}


const sessionStore = MongoStore.create({ mongoUrl: process.env.databaseURL || 'mongodb://127.0.0.1:27017/nodejs_basic_auth', collection: 'sessions' })
app.use(cookieParser());
const expressSession = session({
  secret: process.env.sessionSecret || 'secret',
  resave: true,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 // 1 hour
  }
});

app.use(bodyParser.json({
  extended: false,
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 50000
}));
// app.use(bodyParser());
// default options
app.use(fileUpload());
app.use(expressSession);

//for flash
app.use(flash());

//for passport Strategy
require('./config/passport-config.js')(passport);
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));
app.use('/documents', express.static(path.join(__dirname, 'documents')));


//load routers
// require('./routes/index.js')();

app.use(function (req, res, next) {
  if (true) {
    res.locals.currentUser = req.user;
    res.locals.successMsg = req.flash('success');
    res.locals.errorMsg = req.flash('error');
    next();
    // res.redirect('back');
  }
});

/* //for flash varibles
app.use((req, res, next) => {
  console.log(req.flash('error'));
  res.locals.successMsg = req.flash('success');
  res.locals.errorMsg = req.flash('error');
  next();
}); */

app.use('/', require('./routes/index.js')());
app.get('/ping', function (req, res, next) {
  return res.send('pong')
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
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

module.exports = app;
