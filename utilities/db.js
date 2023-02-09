const mongoose = require("mongoose");
const debug = require("debug")("DatabaseConnection");
const logger = require("../utilities/logger");

let db = process.env.DB_URL;

module.exports = ()=>{
    mongoose.connect(db).then(()=>{
        debug("Connect successfully to "+ db);
        logger.info("Connect successfully to "+ db);
    }).catch((reason)=>{
        debug("Couldn't connect to "+ db);
        logger.info("Couldn't connect to "+ db);
    });
};