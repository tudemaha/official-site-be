const express = require("express");
const {
	signupHandler,
	loginHandler,
	editPasswordHandler,
} = require("./../controller/account_controller");
const { Account } = require("./../model/models");
const { checkToken, updateToken } = require("./../utils/token");
const { deleteAccountValidator } = require("./../utils/validation");
const { checkBcrypt, createBcrypt } = require("../utils/bcrypt");

const router = express.Router();
router.use(express.json());

router.post("/signup", signupHandler);
router.post("/login", loginHandler);
router.put("/:username", editPasswordHandler);
router.delete("/:username", async (req, res) => {
	const reqBody = req.body;
	const username = req.params.username.replace(":", "");
	const authorization = req.headers.authorization.split(" ");

	const reqErrors = deleteAccountValidator(reqBody);
	if (reqErrors.length != 0) {
		res.status(400).json({
			status: false,
			code: 400,
			message: "input not valid",
			data: {
				errors: reqErrors,
			},
		});
		return;
	}

	const validate = await checkToken(authorization.slice(-1));
	if (
		typeof validate == "boolean" ||
		!validate ||
		authorization[0] != "Bearer"
	) {
		res.status(401).json({
			status: false,
			code: 401,
			message: "access unauthorized",
			data: null,
		});
		return;
	}

	let account = await Account.findAll({
		where: {
			username,
		},
		attributes: ["password"],
	});
	account = account[0];

	let status = false;
	if (
		validate.username == username &&
		(await checkBcrypt(account.password, reqBody.password))
	) {
		await Account.destroy({
			where: {
				username,
				password: account.password,
			},
		});
		status = true;
	}

	if (!status) {
		res.status(403).json({
			status: false,
			code: 403,
			message: "forbidden access",
			data: {
				errors: ["invalid credentials for account to delete password"],
			},
		});
		return;
	}

	res.status(200).json({
		status: true,
		code: 200,
		message: "account deleted successfully",
		data: null,
	});
});

module.exports = router;
