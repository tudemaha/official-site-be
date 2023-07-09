const { Op } = require("sequelize");

const { Post, Thread, Account } = require("./../model/models");
const { checkToken, updateToken } = require("./../utils/token");
const { editRoleValidator } = require("./../utils/validation");
const sequelize = require("../model/connection");

const getSuperDetailHandler = async (req, res) => {
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

	if (validate.role < 1) {
		res.status(403).json({
			status: false,
			code: 403,
			message: "forbidden access",
			data: null,
		});
	}

	const post = await Post.count();
	const thread = await Thread.count({
		where: {
			title: {
				[Op.not]: null,
			},
		},
	});
	const account = await Account.count();

	const newToken = await updateToken(validate.email);
	res.set("Authorization", `Bearer ${newToken}`);

	res.status(200).json({
		status: true,
		code: 200,
		message: "success",
		data: {
			post,
			thread,
			account,
		},
	});
};

const getAllAccountHandler = async (req, res) => {
	let authorization = req.headers.authorization;

	let currentPage = req.query.page;
	currentPage = currentPage == undefined || currentPage < 1 ? 1 : currentPage;
	const limit = 10;
	const firstData = currentPage * limit - limit;

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

	if (validate.role < 1) {
		res.status(403).json({
			status: false,
			code: 403,
			message: "forbidden access",
			data: null,
		});
	}

	const account = await Account.findAndCountAll({
		offset: firstData,
		limit,
		order: [["createdAt", "DESC"]],
		attributes: ["username", "role", "email", "createdAt", "updatedAt"],
	});

	const pageCount = Math.ceil(account.count / limit);

	const newToken = await updateToken(validate.email);
	res.set("Authorization", `Bearer ${newToken}`);

	res.status(200).json({
		status: true,
		code: 200,
		message: "success",
		data: {
			count: account.count,
			account: account.rows,
			pagination: {
				current_page: parseInt(currentPage, 10),
				page_count: pageCount,
			},
		},
	});
};

const editRoleHandler = async (req, res) => {
	const username = req.params.username.replace(":", "");
	const reqBody = req.body;

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

	if (validate.role < 1) {
		res.status(403).json({
			status: false,
			code: 403,
			message: "forbidden access",
			data: null,
		});
	}

	const reqError = editRoleValidator(reqBody);
	if (reqError.length != 0) {
		res.status(400).json({
			status: false,
			code: 400,
			message: "input not valid",
			data: null,
		});
		return;
	}

	const updateRole = async (transaction) => {
		const account = await Account.findOne({
			where: {
				username,
			},
		});

		if (account === null) {
			throw new Error("account not found");
		}

		await account.update(
			{
				role: reqBody.role,
			},
			{ transaction }
		);
	};

	sequelize
		.transaction(updateRole)
		.then(async () => {
			const newToken = await updateToken(validate.email);
			res.set("Authorization", `Bearer ${newToken}`);
			res.status(200).json({
				status: true,
				code: 200,
				message: "role updated successfully",
				data: null,
			});
		})
		.catch(() => {
			res.status(500).json({
				status: false,
				code: 400,
				message: "account not found",
				data: null,
			});
		});
};

module.exports = {
	getSuperDetailHandler,
	getAllAccountHandler,
	editRoleHandler,
};
