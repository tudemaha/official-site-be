const sequelize = require("../model/connection");
const path = require("node:path");
const fs = require("node:fs");
const { Profile } = require("./../model/models");
const { checkToken, updateToken } = require("../utils/token");
const { editProfileValidator } = require("../utils/validation");

const fileDirectory = "images/";

const readProfileHandler = async (req, res) => {
	const username = req.params.username.replace(":", "");

	let profile = await Profile.findOne({
		where: {
			AccountUsername: username,
		},
		attributes: {
			exclude: ["id", "createdAt", "updatedAt", "AccountUsername"],
		},
	});

	if (profile == null) {
		res.status(404).json({
			status: false,
			code: 404,
			message: "data not found",
			data: null,
		});
		return;
	}

	const url = new URL(
		path.join(fileDirectory, profile.image),
		"http://" + req.headers.host
	);
	profile.image = url.toString();

	res.status(200).json({
		status: true,
		code: 200,
		message: "get data success",
		data: profile,
	});
};

const editProfileHandler = async (req, res) => {
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

	const reqErrors = editProfileValidator(reqBody);
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

	const updateTransaction = async (transaction) => {
		const profile = await Profile.findOne({
			where: {
				AccountUsername: username,
			},
		});

		profile.name = reqBody.name;
		profile.position = reqBody.position;
		profile.grade = reqBody.grade;
		profile.education = reqBody.education;
		profile.address = reqBody.address;
		profile.wa = reqBody.wa;
		profile.instagram = reqBody.instagram;
		profile.about = reqBody.about;

		await profile.save({ transaction });
	};

	const newToken = await updateToken(validate.email);

	sequelize
		.transaction(updateTransaction)
		.then(async () => {
			res.set("Authorization", `Bearer ${newToken}`);
			res.status(200).json({
				status: true,
				code: 200,
				message: "profile updated successfully",
				data: null,
			});
		})
		.catch((err) => {
			res.status(500).json({
				status: false,
				code: 500,
				message: "request failed, server error",
				data: {
					errors: err,
				},
			});
		});
};

const editImageHandler = async (req, res) => {
	const username = req.params.username.replace(":", "");
	const reqFile = req.file;
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

	const profile = await Profile.findOne({
		where: {
			AccountUsername: username,
		},
	});

	const fileBuffer = reqFile.buffer;
	const fileName = username + path.extname(reqFile.originalname);
	const filePath = path.join(fileDirectory, fileName);

	if (profile.image != "default.png") {
		fs.unlinkSync(path.join(fileDirectory, profile.image));
	}

	fs.writeFileSync(filePath, fileBuffer);
	profile.image = fileName;
	profile
		.save()
		.then(async () => {
			const newToken = await updateToken(validate.email);
			res.set("Authorization", `Bearer ${newToken}`);
			res.status(200).json({
				status: true,
				code: 200,
				message: "profile picture updated successfully",
				data: null,
			});
		})
		.catch((err) => {
			res.status(500).json({
				status: false,
				code: 500,
				message: "request failed, server error",
				data: {
					errors: err,
				},
			});
		});
};

module.exports = { readProfileHandler, editProfileHandler, editImageHandler };
