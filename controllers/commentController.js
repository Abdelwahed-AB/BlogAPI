const { Comment } = require("../models/Comment");
const { Post } = require("../models/Post");
const myTransaction = require("../utilities/myTransaction");



exports.get_comments = async (req, res) =>{
    let postId = req.params.postId;
    let post = await Post.findById(postId);

    if(!post)
        return res.status(404).send(`Post with id ${postId} not found.`);

    let comments = await Comment.find({post: postId});
    res.json(comments);
};


exports.get_comment = async (req, res) =>{
    let postId = req.params.postId;
    let post = await Post.findById(postId);

    if(!post)
        return res.status(404).send(`Post with id ${postId} not found.`);
    
    let id = req.params.commentId;
    let comment = await Comment.findById(id);
    if(!comment)
        return res.status(404).send(`Comment with id ${id} not found.`);
    
    res.json(comment);
};

exports.create_comment = async (req, res) => {
    let postId = req.params.postId;
    let post = await Post.findById(postId);

    if(!post)
        return res.status(404).send(`Post with id ${postId} not found.`);

    let comment = new Comment(req.body);
    comment.author = req.user._id;
    comment.post = post._id;

    await myTransaction(async (session)=>{
        post.comments.push(comment._id);
        await comment.save({session});
        post = await post.save({session});
    });

    res.json(comment);
};

exports.update_comment = async (req, res) =>{
    let id = req.params.commentId;
    let comment = await Comment.findById(id);

    let postId = req.params.postId;
    let post = await Post.findById(postId);
    
    if(!post)
        return res.status(404).send(`Post with id ${postId} not found.`);

    if( !comment )
        return res.status(404).send(`Comment with id ${id} not found.`);

    if( comment.author.toHexString() !== req.user._id.toHexString() )
        return res.status(403).send("User does not have permission to update comment.");
    
    comment.content = req.body.content;

    await comment.save();
    res.json(comment);
};

exports.delete_comment = async (req, res) =>{
    let id = req.params.commentId;
    let comment = await Comment.findById(id);

    if(!comment)
        return res.status(404).send(`Comment with id ${id} not found.`);
    
    let post = await Post.findById(req.params.postId);
    if(!post)
        return res.status(404).send(`Post with id ${id} not found.`);

    if( comment.author.toHexString() !== req.user._id.toHexString() )
        return res.status(403).send("User does not have permission to delete comment.");
    
    await myTransaction(async (session)=>{
        //*delete comment from post
        post.comments = post.comments.filter((c)=> c.toHexString() != comment._id.toHexString());
        await comment.delete({session});
        await post.save({session});
    })
    res.json(comment);
};