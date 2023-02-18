const { Comment } = require("../models/Comment");

exports.get_comments = async (req, res) =>{
    let postId =  req.params.post_id;
    let comments = await Comment.find({post: postId});

    res.json(comments);
};


exports.get_comment = async (req, res) =>{
    let id = req.params.id;
    let comment = await Comment.findById(id);

    res.json(comment);
};

exports.create_comment = async (req, res) => {
    let comment = new Comment(req.body);
    comment.author = req.user._id;

    await comment.save();

    res.json(comment);
};

exports.update_comment = async (req, res) =>{
    let id = req.params.id;
    let comment = await Comment.findById(id);

    if(!comment)
        return res.status(404).send(`Comment with id ${id} not found.`);

    if( comment.author.toHexString() !== req.user._id.toHexString() )
        return res.status(403).send("User does not have permission to update comment.");
    
    comment.content = res.body.content;

    await comment.save();
    res.json(comment);
};

exports.delete_comment = async (req, res) =>{
    let id = req.params.id;
    let comment = await Comment.findById(id);

    if(!comment)
        return res.status(404).send(`Comment with id ${id} not found.`);

    if( comment.author.toHexString() !== req.user._id.toHexString() )
        return res.status(403).send("User does not have permission to delete comment.");
    
    await comment.delete();

    res.json(comment);
};