const {Post} = require("../models/Post");

//get all posts in db
exports.get_posts = async (req, res) => {
    let posts = await Post.find({});
    res.json(posts);
};

//get a specific post
exports.get_post = async (req, res) => {
    let id = req.params.postId;

    let post = await Post.findById(id);
    if(!post)
        return res.status(404).send(`Post with id ${id} not found.`);
    
    res.json(post);
};

exports.create_post = async (req, res) => {
    let user = req.user;

    let post = new Post({
        title: req.body.title,
        content: req.body.content,
        author: user._id
    });

    await post.save();
    res.send(post);
};

exports.update_post = async (req, res) => {
    let id = req.params.postId;
    let user = req.user;

    let post = await Post.findById(id);
    if(!post)
        return res.status(404).send(`Post with id ${id} not found.`);
    
    if(post.author.toHexString() !== user._id.toHexString())
        return res.status(403).send("User does not have permission to update post.");

    post.title = req.body.title;
    post.content = req.body.content;

    await post.save();
    res.json(post);
};

/** @type {import("express").RequestHandler} */
exports.delete_post = async (req, res) => {
    let id = req.params.postId;
    let user = req.user;

    let post = await Post.findById(id);
    if(!post)
        return res.status(404).send(`Post with id ${id} not found.`);
    
    if(post.author.toHexString() !== user._id.toHexString())
        return res.status(403).send("User does not have permission to delete post.");
    
    //TODO delete post comments
    await post.delete();
    res.json(post);
};