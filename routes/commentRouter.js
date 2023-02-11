const express = require("express");
const router = express.Router();

const CommentController = require("../controllers/commentController");

router.get("/", CommentController.get_comments);

router.get("/:id", CommentController.get_comment);

router.post("/", CommentController.create_comment);

router.put("/:id", CommentController.update_comment);

router.delete("/:id", CommentController.delete_comment);

module.exports = router;