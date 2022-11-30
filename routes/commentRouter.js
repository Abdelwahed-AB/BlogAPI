const express = require("express");
const router = express.Router();

const CommentController = require("../controllers/commentController");

router.get("/comments", CommentController.get_comments);

router.get("/comments/:comment_id", CommentController.get_comment);

router.post("/post/:post_id/comments", CommentController.create_comment);

router.put("/post/:post_id/comments/:comment_id", CommentController.update_comment);

router.delete("/post/:post_id/comments/:comment_id", CommentController.delete_comment);

module.exports = router;