const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const express = require("express");
const multer = require("multer");
const { Post } = require("./../model/models");
const { checkToken, updateToken } = require("./../utils/token");
const { createPostValidator } = require("../utils/validation");

const fileDirectory = "images/";

const upload = multer({
	limits: {
		fileSize: 4000000,
	},
	fileFilter: (req, file, cb) => {
		const validMimeType = [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
			"image/svg+xml",
		];

		if (!validMimeType.includes(file.mimetype)) {
			cb(new Error("invalid file type"));
		}
		cb(null, true);
	},
	storage: multer.memoryStorage(),
});

const router = express.Router();

router.post("/create", upload.single("image"), async (req, res) => {
	const reqFile = req.file;
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

	if (reqFile == undefined) {
		res.status(400).json({
			status: false,
			code: 400,
			message: "input not valid",
			data: {
				errors: ["no file uploaded"],
			},
		});
		return;
	}

	const reqErrors = createPostValidator(reqBody);
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
	const fileBuffer = reqFile.buffer;
	const fileName = Date.now() + "-" + Math.round(Math.random() * 1e9);
	const fileExt = path.extname(reqFile.originalname);
	const filePath = fileDirectory + fileName + fileExt;

	fs.writeFileSync(filePath, fileBuffer);

	const post = Post.create({
		slug: reqBody.title.toLowerCase().replace(/ /g, "-"),
		title: reqBody.title,
		image: fileName + fileExt,
		content: reqBody.content,
		AccountUsername: validate.username,
	});

	post
		.then(async () => {
			const newToken = await updateToken(validate.email);
			res.set("Authorization", `Bearer ${newToken}`);
			res.status(201).json({
				status: true,
				code: 201,
				message: "post created successfully",
				data: null,
			});
		})
		.catch((err) => {
			fs.unlinkSync(filePath);
			res.status(400).json({
				status: false,
				code: 400,
				message: "error creating post",
				data: {
					errors: err.errors[0].message,
				},
			});
		});
});

router.get("/:username/:slug", async (req, res) => {
	const username = req.params.username.replace(":", "");
	const slug = req.params.slug.replace(":", "");

	const post = await Post.findOne({
		where: {
			slug,
			AccountUsername: username,
		},
		attributes: {
			exclude: "AccountUsername",
		},
	});

	if (post === null) {
		res.status(404).json({
			status: false,
			code: 400,
			message: "post not found",
			data: null,
		});
		return;
	}

	const url = new URL(
		path.join(fileDirectory, post.image),
		"http://" + req.headers.host
	);
	post.image = url.toString();
	res.status(200).json({
		status: true,
		code: 200,
		message: "get data success",
		data: post,
	});
});

router.use((err, req, res, next) => {
	res.status(400).json({
		status: false,
		code: 400,
		message: "input not valid",
		data: {
			errors: [err.message],
		},
	});
});

router.get("/:username", async (req, res) => {
	const username = req.params.username.replace(":", "");

	let currentPage = req.query.page;
	currentPage = currentPage == undefined || currentPage < 1 ? 1 : currentPage;
	const limit = 10;
	const firstData = currentPage * limit - limit;

	const posts = await Post.findAndCountAll({
		offset: firstData,
		limit,
		where: {
			AccountUsername: username,
		},
		order: [["createdAt", "DESC"]],
		attributes: {
			exclude: "AccountUsername",
		},
	});

	if (posts.count == 0) {
		res.status(404).json({
			status: false,
			code: 404,
			message: "posts not found",
			data: null,
		});
		return;
	}

	const pageCount = Math.ceil(posts.count / limit);
	posts.rows.forEach((row, i) => {
		const url = new URL(
			path.join(fileDirectory, row.image),
			"http://" + req.headers.host
		);
		row.image = url.toString();
		posts.rows[i].image = row.image;
	});

	res.status(200).json({
		status: true,
		code: 200,
		message: "get data success",
		data: {
			posts: posts.rows,
			pagination: {
				current_page: parseInt(currentPage, 10),
				page_count: pageCount,
				first_data: firstData,
			},
		},
	});
});

router.delete("/:slug", async (req, res) => {
	const slug = req.params.slug.replace(":", "");
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

	const post = await Post.findOne({
		where: {
			slug,
		},
	});

	if (post == null) {
		res.status(404).json({
			status: false,
			code: 404,
			message: "post not found",
			data: null,
		});
		return;
	}

	if (post.AccountUsername != validate.username) {
		res.status(403).json({
			status: false,
			code: 403,
			message: "forbidden access",
			data: null,
		});
		return;
	}

	Post.destroy({
		where: {
			slug,
		},
	}).then(() => {
		fs.unlinkSync(path.join(fileDirectory + post.image));
	});

	const newToken = await updateToken(validate.email);
	res.set("Authorization", `Bearer ${newToken}`);
	res.status(200).json({
		status: true,
		code: 200,
		message: "post deleted successfully",
		data: null,
	});
});

module.exports = router;
