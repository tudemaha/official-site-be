const express = require("express");
const {
	signupHandler,
	loginHandler,
	editPasswordHandler,
	deleteAccountHandler,
	logoutHandler,
} = require("./../controller/account_controller");

const router = express.Router();

router.post("/signup", signupHandler);
router.post("/login", loginHandler);
router.put("/:username", editPasswordHandler);
router.delete("/:username", deleteAccountHandler);
router.post("/logout", logoutHandler);

module.exports = router;
