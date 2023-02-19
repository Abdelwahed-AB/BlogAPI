const { default: mongoose } = require("mongoose");
const { Comment } = require("../models/Comment");
const { Post } = require("../models/Post");
const myTransaction = require("../utilities/myTransaction");

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

exports.create_comment = async (req, res, next) => {
    let postId = req.params.post_id;
    let post = await Post.findById(postId);
    if(!post)
        return res.status(404).send(`Post with id ${id} not found.`);

    let comment = new Comment(req.body);
    comment.author = req.user._id;
    comment.post = post._id;

    myTransaction(async (session)=>{
        post.comments.push(comment._id);
        await comment.save({ session });
        await post.save({ session });
    });

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
    
    let post = await Post.findById(req.params.post_id);
    if(!post)
        return res.status(404).send(`Post with id ${id} not found.`);
    
    myTransaction(async (session)=>{
        //*delete comment from post
        post.comments = post.comments.filter((c)=>c != comment._id);
        await comment.delete({ session });
        await post.save({ session });
    })
    res.json(comment);
};