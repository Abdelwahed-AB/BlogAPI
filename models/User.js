const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


var UserSchema = new Schema({
    username: {type: String, required: true, minLength: 5, maxLength: 100, unique: [true, "Username is already taken."]},
    password: {type: String, required: true, maxLength: 255},
    isAdmin: {type: Boolean, default: false},
});
/**
 * Generates the auth token associated to the user object
 * @returns JWT auth token
 */
UserSchema.methods.generateAuthToken = function(){
    return jwt.sign({_id: this._id, username: this.username, isAdmin: this.isAdmin}, process.env.JWTPK);
};

/**
 * Encrypts the password, to be used before storing in the db
 * @returns hashed password
 */
UserSchema.methods.encryptPassword = async function(){
    this.password = await bcrypt.hash(this.password, 10);
    return this.password;
};

/**
 * Verifies if the passed password matches the stored one, 
 * @param {String} password 
 * @returns {Boolean} true if match, false otherwise
 */
UserSchema.methods.verifyPassword = async function(password){
    return await bcrypt.compare(password, this.password);
};
/**
 * Used to validate a user object that's passed in the request
 * @param {*} user 
 * @returns List of errors if there are any
 */
let validateUser = (user) =>{
    let schema = Joi.object({
        username: Joi.string().required().min(5).max(100),
        password: Joi.string().required().min(6).max(50),
    });

    let err = schema.validate(user).error;
    return err;
}

exports.User = mongoose.model("user", UserSchema);
exports.validateUser = validateUser;