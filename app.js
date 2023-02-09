require("dotenv").config();

var debug = require("debug")("App");
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');

//Custom middleware
const error = require("./middleware/error");

//utilities
const setupRoutes = require("./utilities/routing");
const connectDb = require("./utilities/db");
const logger = require("./utilities/logger");

var app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  next(createError(404));
});

connectDb();
setupRoutes(app);

// error handler
app.use(error);

let PORT = process.env.PORT;
app.listen(PORT, ()=>{
  debug("listening on port : " + PORT);
  logger.info(" App listening on port : " + PORT);
});
