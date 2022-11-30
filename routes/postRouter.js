const express = require("express");
const router = express.Router();

const PostController = require("../controllers/postController");

router.get("/posts", PostController.get_posts);

router.get("/posts/:id", PostController.get_post);

router.post("/posts", PostController.create_post);

router.put("/posts/:post_id", PostController.update_post);

router.delete("/posts/:post_id", PostController.delete_post);

module.exports = router;