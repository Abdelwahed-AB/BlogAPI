const express = require("express");
const router = express.Router({mergeParams: true});
const CommentController = require("../controllers/commentController");

router.get("/", CommentController.get_comments);

router.get("/:commentId", CommentController.get_comment);

router.post("/", CommentController.create_comment);

router.put("/:commentId", CommentController.update_comment);

router.delete("/:commentId", CommentController.delete_comment);

module.exports = router;