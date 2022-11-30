const express = require("express");
const router = express.Router();

const UserController = require("../controllers/userController");

router.get("/users", UserController.get_users);

router.get("/users/:id", UserController.get_user);

router.post("/users", UserController.create_user);

router.put("/users/:id", UserController.update_user);

router.delete("/users/:id", UserController.delete_user);

module.exports = router;