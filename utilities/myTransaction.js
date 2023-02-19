const mongoose = require("mongoose");
const logger = require("../utilities/logger");
/**
 * A wrapper for mongoose transactions
 * @param { Function } transactionFunction must take a session as a parameter.
 */
module.exports = async (transactionFunction) => {
    try{
        const session = await mongoose.startSession();
    
        await session.withTransaction(transactionFunction(session));

        session.endSession();
    }catch(err){
        logger.error(err);
    }
};