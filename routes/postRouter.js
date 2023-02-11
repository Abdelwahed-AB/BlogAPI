const express = require("express");
const router = express.Router();

const PostController = require("../controllers/postController");

router.get("/", PostController.get_posts);

router.get("/:id", PostController.get_post);

router.post("/", PostController.create_post);

router.put("/:id", PostController.update_post);

router.delete("/:id", PostController.delete_post);

module.exports = router;