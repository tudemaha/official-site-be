const fs = require("node:fs");
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
		slug: reqBody.title.toLowerCase().replace(" ", "-"),
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
			res.status(500).json({
				status: false,
				code: 500,
				message: "error creating post",
				data: {
					errors: err.errors[0].message,
				},
			});
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

module.exports = router;
