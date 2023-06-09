const { Account, Profile } = require("./../model/models");
const { createBcrypt, checkBcrypt } = require("./../utils/bcrypt");
const { checkToken, updateToken } = require("./../utils/token");
const {
	signupValidator,
	loginValidator,
	editPasswordValidator,
	deleteAccountValidator,
} = require("../utils/validation");
const sequelize = require("../model/connection");

const signupHandler = async (req, res) => {
	const reqBody = req.body;

	const reqErrors = signupValidator(reqBody);
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

	const passwordHash = await createBcrypt(reqBody.password);

	const createTransaction = async (transaction) => {
		await Account.create(
			{
				username: reqBody.username,
				email: reqBody.email,
				password: passwordHash,
			},
			{ transaction }
		);

		await Profile.create(
			{
				AccountUsername: reqBody.username,
			},
			{ transaction }
		);
	};

	sequelize
		.transaction(createTransaction)
		.then(() => {
			res.status(201).json({
				status: true,
				code: 201,
				message: "signup success",
				data: null,
			});
		})
		.catch((err) => {
			res.status(409).json({
				status: false,
				code: 409,
				message: "conflict data input",
				data: {
					errors: [err.errors[0].message],
				},
			});
		});
};

const loginHandler = async (req, res) => {
	let reqBody = req.body;

	const reqErrors = loginValidator(reqBody);
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

	let account = await Account.findOne({
		where: {
			email: reqBody.email,
		},
		attributes: ["username", "email", "password", "role"],
	});

	if (account == null) {
		res.status(404).json({
			status: false,
			code: 404,
			message: "data not found",
			data: {
				errors: ["email or password incorrect"],
			},
		});
		return;
	}

	let passStatus = await checkBcrypt(account.password, reqBody.password);
	if (!passStatus) {
		res.status(404).json({
			status: false,
			code: 404,
			message: "data not found",
			data: {
				errors: ["email or password incorrect"],
			},
		});
		return;
	}

	const token = await updateToken(account.email);

	res.set("Authorization", `Bearer ${token}`);
	res.status(200).json({
		status: true,
		code: 200,
		messsage: "login success",
		data: {
			username: account.username,
			role: account.role,
		},
	});
};

const editPasswordHandler = async (req, res) => {
	const reqBody = req.body;
	const username = req.params.username.replace(":", "");
	let authorization = req.headers.authorization;
	authorization = authorization != undefined ? authorization.split(" ") : "";

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

	const reqErrors = editPasswordValidator(reqBody);
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

	if (reqBody.old_password === reqBody.new_password) {
		res.status(400).json({
			status: false,
			code: 400,
			message: "input not valid",
			data: {
				errors: ["password and new password cannot the same"],
			},
		});
		return;
	}

	let account = await Account.findOne({
		where: {
			username,
		},
		attributes: ["password"],
	});

	const newPassword = await createBcrypt(reqBody.new_password);
	let status = false;

	if (
		validate.username == username &&
		validate.email == reqBody.email &&
		(await checkBcrypt(account.password, reqBody.old_password))
	) {
		await Account.update(
			{
				password: newPassword,
			},
			{
				where: {
					email: validate.email,
				},
			}
		);
		status = true;
	}

	if (!status) {
		res.status(403).json({
			status: false,
			code: 403,
			message: "forbidden access",
			data: {
				errors: ["invalid credentials for account to change password"],
			},
		});
		return;
	}

	const newToken = await updateToken(validate.email);
	res.set("Authorization", `Bearer ${newToken}`);
	res.status(200).json({
		status: true,
		code: 200,
		message: "password changed successfully",
		data: null,
	});
};

const deleteAccountHandler = async (req, res) => {
	const reqBody = req.body;
	const username = req.params.username.replace(":", "");
	let authorization = req.headers.authorization;
	authorization = authorization != undefined ? authorization.split(" ") : "";

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

	let account = await Account.findOne({
		where: {
			username,
		},
		attributes: ["password"],
	});

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
};

const logoutHandler = async (req, res) => {
	let authorization = req.headers.authorization;
	authorization = authorization != undefined ? authorization.split(" ") : "";

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

	await Account.update(
		{
			token: null,
		},
		{
			where: {
				username: validate.username,
			},
		}
	);

	res.status(200).json({
		status: true,
		code: 200,
		message: "logout success",
		data: null,
	});
};

module.exports = {
	signupHandler,
	loginHandler,
	editPasswordHandler,
	deleteAccountHandler,
	logoutHandler,
};
