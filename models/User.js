const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");
const jwt = require("jsonwebtoken");

var UserSchema = new Schema({
    username: {type: String, required: true, minLength: 5, maxLength: 100, unique: true},
    password: {type: String, required: true, maxLength: 255},
    isAdmin: {type: Boolean, default: false},
});

UserSchema.methods.generateAuthToken = function(){
    return jwt.sign({_id: this._id, username: this.username, isAdmin: this.isAdmin}, process.env.JWTPK);
}

/**
 * Used to validate a user object that's passed in the request
 * @param {*} user 
 * @returns List of errors if there are any
 */
let validateUser = (user) =>{
    let schema = Joi.object({
        username: Joi.string().required().max(100).min(5),
        password: Joi.string().required().min(6).max(50),
    });

    let err = schema.validate(user).error;
    return err;
}

exports.User = mongoose.model("user", UserSchema);
exports.validateUser = validateUser;