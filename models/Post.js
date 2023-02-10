const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");


const PostSchema = new Schema({
    title: {type: String, required: true, maxLength: 200, minLength: 5},
    content: {type: String, required: true, maxLength: 2000},
    author: {type: mongoose.Types.ObjectId, required: true},
    comments: [mongoose.Types.ObjectId],
    date: {type: Date, default: new Date()},
});

const validatePost = (post)=>{

    //*We only need to check title and content, since author will be the logged in user
    let schema = Joi.object({
        title: Joi.string().required().min(5).max(200),
        content: Joi.string().required().max(2000),
    });

    let err = schema.validate(post).error;
    return err;
};

exports.Post = mongoose.model('post', PostSchema);
exports.validatePost = validatePost;