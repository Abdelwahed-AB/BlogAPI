const express = require("express");
const router = express.Router({mergeParams: true});
const passport = require("passport");

const CommentController = require("../controllers/commentController");
const validate = require("../middleware/validate");
const { validateComment } = require("../models/Comment");

router.get("/", CommentController.get_comments);

router.get("/:commentId", CommentController.get_comment);

router.post("/", [passport.authenticate("jwt", {session: false}), validate(validateComment)], CommentController.create_comment);

router.put("/:commentId", [passport.authenticate("jwt", {session: false}), validate(validateComment)], CommentController.update_comment);

router.delete("/:commentId", passport.authenticate("jwt", {session: false}), CommentController.delete_comment);

module.exports = router;