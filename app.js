require("dotenv").config();

var debug = require("debug")("App");
var express = require('express');
const passport = require("passport");

//Custom middleware
const error = require("./middleware/error");

//utilities
const validationSetup = require("./utilities/validationSetup");
const setupRoutes = require("./utilities/routing");
const connectDb = require("./utilities/db");
const logger = require("./utilities/logger");
const setupPassport = require("./utilities/setupPassport");


var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

setupPassport(passport);
validationSetup();
connectDb();
setupRoutes(app);

// error handler
app.use(error);

let PORT = (process.env.NODE_ENV == "test")? 0 : process.env.PORT;

const server = app.listen(PORT, ()=>{
  debug("listening on port : " + PORT);
  logger.info(" App listening on port : " + PORT);
});

module.exports = server;