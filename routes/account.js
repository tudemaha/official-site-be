const express = require("express");
const {
	signupHandler,
	loginHandler,
	editPasswordHandler,
} = require("./../controller/account_controller");
const { Account } = require("./../model/models");
const { checkToken, updateToken } = require("./../utils/token");
const { editPasswordValidator } = require("./../utils/validation");
const { checkBcrypt, createBcrypt } = require("../utils/bcrypt");

const router = express.Router();
router.use(express.json());

router.post("/signup", signupHandler);
router.post("/login", loginHandler);
router.put("/:username", editPasswordHandler);
router.delete("/:username", (req, res) => {});

module.exports = router;
