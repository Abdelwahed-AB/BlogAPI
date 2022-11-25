var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {type: String, required: true, maxLength: 100, unique: true},
    password: {type: String, required: true},
});

module.exports = mongoose.model("user", UserSchema);