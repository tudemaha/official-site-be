const { Account } = require("./../model/models");
const { createBcrypt, checkBcrypt } = require("./../utils/bcrypt");
const { checkToken, updateToken } = require("./../utils/token");
const {
	signupValidator,
	loginValidator,
	editPasswordValidator,
} = require("../utils/validation");

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

	const result = Account.create({
		username: reqBody.username,
		email: reqBody.email,
		password: passwordHash,
	});

	result
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

	let account = await Account.findAll({
		where: {
			email: reqBody.email,
		},
		attributes: ["username", "email", "password"],
	});

	if (account.length === 0) {
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
	account = account[0];

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
		},
	});
};

const editPasswordHandler = async (req, res) => {
	const reqBody = req.body;
	const username = req.params.username;
	const authorization = req.headers.authorization.split(" ");

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

	let account = await Account.findAll({
		where: {
			username: validate.username,
		},
		attributes: ["password"],
	});
	account = account[0];

	const newPassword = await createBcrypt(reqBody.new_password);
	let status = false;

	if (
		validate.username == username.split(":").slice(-1) &&
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

module.exports = { signupHandler, loginHandler, editPasswordHandler };
