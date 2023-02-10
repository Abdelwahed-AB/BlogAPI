const winston = require("winston");
const format = winston.format;

const myFormat = format.printf(({level, message, timestamp, ...metadata})=>{
    let msg = `${timestamp}[${level}] : ${message}`;
    if(metadata)
        msg += "; "+JSON.stringify(metadata);
    return msg;
});

let logPath = process.env.NODE_ENV == "test"? "logs/test": "logs";

const logger = winston.createLogger({
    format: winston.format.combine(
        format.splat(),
        format.timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.File({filename: logPath + "/error.log", level: "error"}),
        new winston.transports.Console({level: "error"}), //!Remove in production
        new winston.transports.File({filename: logPath + "/combined.log"})
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: logPath + '/exceptions.log', handleExceptions: true, handleRejections: true}),
        new winston.transports.File({ filename: logPath + '/combined.log' })
    ]
});

module.exports = logger;