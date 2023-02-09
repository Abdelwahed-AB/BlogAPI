const debug = require("debug")('ErrorMiddleware');
const logger = require("../utilities/logger");

module.exports = function(err, req, res, next) {
    //TODO: Log the errors using the logger
    logger.error(err.message, err);
    debug(err.message);
    res.status(500).send("Internal Server Error.");
};