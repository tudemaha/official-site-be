const { Profile, Account } = require("./../model/models");

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

module.exports = { readProfileHandler };
