var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    content: {type: String, required: true},
    author: {type: mongoose.Types.ObjectId},
    date: {type: Date, required: true},
    post: {type: mongoose.Types.ObjectId},
});

module.exports = mongoose.model("comment", CommentSchema);