const express = require("express");
const router = express.Router();
const passport = require("passport");

const PostController = require("../controllers/postController");
const validate = require("../middleware/validate");
const { validatePost } = require("../models/Post");

router.get("/", PostController.get_posts);

router.get("/:id", PostController.get_post);

router.post("/", [passport.authenticate("jwt", {session: false}), validate(validatePost)], PostController.create_post);

router.put("/:id", [passport.authenticate("jwt", {session: false}), validate(validatePost)], PostController.update_post);

router.delete("/:id", [passport.authenticate("jwt", {session: false}), validate(validatePost)], PostController.delete_post);

module.exports = router;