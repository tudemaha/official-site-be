const express = require("express");
const router = express.Router();

const { Thread } = require("../model/models");
const { checkToken, updateToken } = require("../utils/token");
const {
	createThreadValidator,
	createCommentValidator,
	editActiveValidator,
} = require("../utils/validation");

router.post("/create", async (req, res) => {
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

	const reqErrors = createThreadValidator(reqBody);
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

	const thread = Thread.create({
		title: reqBody.title,
		content: reqBody.content,
		PostSlug: reqBody.slug,
		AccountUsername: validate.username,
	});

	thread
		.then(async () => {
			const newToken = await updateToken(validate.email);
			res.set("Authorization", `Bearer ${newToken}`);
			res.status(201).json({
				status: true,
				code: 201,
				message: "thread created successfully",
				data: null,
			});
		})
		.catch((err) => {
			res.status(400).json({
				status: false,
				code: 400,
				message: "error creating thread",
				data: {
					errors: err.errors[0].message,
				},
			});
		});
});

router.post("/comment", async (req, res) => {
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

	const reqErrors = createCommentValidator(reqBody);
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

	const comment = Thread.create({
		parentId: reqBody.parent,
		content: reqBody.content,
		AccountUsername: validate.username,
	});

	comment
		.then(async () => {
			const newToken = await updateToken(validate.email);
			res.set("Authorization", `Bearer ${newToken}`);
			res.status(201).json({
				status: true,
				code: 201,
				message: "comment created successfully",
				data: null,
			});
		})
		.catch((err) => {
			res.status(400).json({
				status: false,
				code: 400,
				message: "error creating comment",
				data: {
					errors: {
						code: err.parent.code,
						error_message: err.parent.sqlMessage,
						field_error: err.fields,
					},
				},
			});
		});
});

router.get("/:slug", async (req, res) => {
	const slug = req.params.slug.replace(":", "");

	let currentPage = req.query.page;
	currentPage = currentPage != undefined ? parseInt(currentPage) : 1;
	const limit = 10;
	const firstData = currentPage * limit - limit;

	const thread = await Thread.findAndCountAll({
		include: {
			association: "Post",
			attributes: ["AccountUsername"],
		},
		offset: firstData,
		limit,
		where: {
			postSlug: slug,
		},
		order: [["createdAt", "DESC"]],
		attributes: {
			exclude: ["PostSlug", "parentId"],
		},
	});

	if (thread.count == 0) {
		res.status(404).json({
			status: false,
			code: 404,
			message: "thread not found",
			data: null,
		});
		return;
	}

	thread.rows.forEach((data) => {
		data.dataValues.thread_owner = data.dataValues.AccountUsername;
		data.dataValues.post_ownder = data.dataValues.Post.AccountUsername;
		delete data.dataValues.AccountUsername;
		delete data.dataValues.Post;
	});

	const pageCount = Math.ceil(thread.count / limit);

	res.status(200).json({
		status: true,
		code: 200,
		message: "get data success",
		data: {
			threads: thread.rows,
			pagination: {
				current_page: parseInt(currentPage, 10),
				page_count: pageCount,
				first_data: firstData,
			},
		},
	});
});

router.get("/comment/:id", async (req, res) => {
	const id = req.params.id.replace(":", "");

	const reply = await Thread.findAll({
		where: {
			parentId: id,
		},
		attributes: {
			exclude: ["PostSlug", "active", "title"],
		},
	});

	if (reply.length == 0) {
		res.status(404).json({
			status: false,
			code: 404,
			message: "thread not found",
			data: null,
		});
		return;
	}

	reply.forEach((data) => {
		data.dataValues.username = data.dataValues.AccountUsername;
		delete data.dataValues.AccountUsername;
	});

	res.status(200).json({
		status: true,
		code: 200,
		message: "get data success",
		data: {
			replies: reply,
		},
	});
});

router.put("/:id", async (req, res) => {
	const id = req.params.id.replace(":", "");
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

	const reqErrors = editActiveValidator(reqBody);
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

	const thread = await Thread.findOne({
		include: {
			association: "Post",
			attributes: ["AccountUsername"],
		},
		where: {
			id,
		},
	});

	if (
		thread.AccountUsername != validate.username &&
		thread.Post.AccountUsername != validate.username
	) {
		res.status(403).json({
			status: false,
			code: 403,
			message: "forbidden access",
			data: null,
		});
		return;
	}

	thread.active = reqBody.active;
	thread
		.save()
		.then(async () => {
			const newToken = await updateToken(validate.email);
			res.set("Authorization", `Bearer ${newToken}`);
			res.status(200).json({
				status: true,
				code: 200,
				message: "thread updated successfully",
				data: null,
			});
		})
		.catch((err) => {
			res.status(400).json({
				status: false,
				code: 400,
				message: "error updating thread",
				data: {
					errors: {
						code: err.parent.code,
						error_message: err.parent.sqlMessage,
						field_error: err.fields,
					},
				},
			});
		});
});

module.exports = router;
