const winston = require("winston");
const format = winston.format;

const myFormat = format.printf(({level, message, timestamp, ...metadata})=>{
    let msg = `${timestamp}[${level}] : ${message}`;
    if(metadata)
        msg += JSON.stringify(metadata);
    return msg;
});

const logger = winston.createLogger({
    format: winston.format.combine(
        format.splat(),
        format.timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.File({filename: "logs/error.log", level: "error"}),
        new winston.transports.Console({level: "error"}), //!Remove in production
        new winston.transports.File({filename: "logs/combined.log"})
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log', handleExceptions: true, handleRejections: true}),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

module.exports = logger;