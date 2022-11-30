var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    title: {type: String, required: true, maxLength: 200},
    content: {type: String, required: true},
    author: {type: mongoose.Types.ObjectId},
    comments: [mongoose.Types.ObjectId],
    date: {type: Date},
});

module.exports = mongoose.model('post', PostSchema);