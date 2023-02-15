const express = require("express");
const router = express.Router();
const passport = require("passport");

const { validateUser } = require("../models/User");
const checkUsername = require("../middleware/checkUsername");
const validate = require("../middleware/validate");
const admin = require("../middleware/admin");

const UserController = require("../controllers/userController");

router.get("/", [passport.authenticate("jwt", {session: false}), admin], UserController.get_users);

router.get("/:id", [passport.authenticate("jwt", {session: false}), admin], UserController.get_user);

router.post("/", [validate(validateUser), checkUsername] , UserController.create_user);

router.post("/login", validate(validateUser), UserController.login_user);

router.put("/:id", [passport.authenticate("jwt", {session: false}), validate(validateUser), checkUsername], UserController.update_user);

router.delete("/:id", [passport.authenticate("jwt", {session: false}), admin], UserController.delete_user);

module.exports = router;