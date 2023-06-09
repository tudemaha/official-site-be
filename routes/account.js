const express = require("express");
const {
	signupHandler,
	loginHandler,
	editPasswordHandler,
	deleteAccountHandler,
} = require("./../controller/account_controller");
const { Account } = require("./../model/models");
const { checkToken, updateToken } = require("./../utils/token");
const { checkBcrypt, createBcrypt } = require("../utils/bcrypt");

const router = express.Router();
router.use(express.json());

router.post("/signup", signupHandler);
router.post("/login", loginHandler);
router.put("/:username", editPasswordHandler);
router.delete("/:username", deleteAccountHandler);

router.post("/logout", async (req, res) => {
	let authorization = req.headers.authorization;
	authorization = authorization != undefined ? authorization.split(" ") : "";
});

module.exports = router;
