const sequelize = require("../model/connection");
const { Profile, Account } = require("./../model/models");
const { checkToken, updateToken } = require("../utils/token");
const { editProfileValidator } = require("../utils/validation");

const readProfileHandler = async (req, res) => {
	const username = req.params.username.replace(":", "");

	let profile = await Profile.findAll({
		include: {
			model: Account,
			required: true,
			where: {
				username,
			},
			attributes: [],
		},
		attributes: ["name", "position", "grade", "education", "address"],
	});

	if (profile.length == 0) {
		res.status(404).json({
			status: false,
			code: 404,
			message: "data not found",
			data: null,
		});
		return;
	}

	profile = profile[0];

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
			include: {
				model: Account,
				required: true,
				where: {
					username,
				},
			},
		});

		profile.name = reqBody.name;
		profile.position = reqBody.position;
		profile.grade = reqBody.grade;
		profile.education = reqBody.education;
		profile.address = reqBody.address;

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

module.exports = { readProfileHandler, editProfileHandler };
