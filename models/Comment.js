const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const CommentSchema = new Schema({
    content: {type: String, required: true},
    author: {type: mongoose.Types.ObjectId, required: true},
    date: {type: Date, required: true, default: new Date()},
    post: {type: mongoose.Types.ObjectId, required: true},
});

/**
 * Used to validate a comment object that's passed in the request
 * @param {*} comment 
 * @returns List of errors if there are any
 */
let validateComment = (comment) =>{
    let schema = Joi.object({
        content: Joi.string().required(),
        // post: Joi.objectId().required(), //not needed bcz its in the url already
    });

    let err = schema.validate(comment).error;
    return err;
};

exports.Comment = mongoose.model("comment", CommentSchema);
exports.validateComment = validateComment;