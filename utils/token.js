const crypto = require("crypto");
const { Account } = require("../model/models");

const generateToken = (size = 64) => {
	const buf = crypto.randomBytes(size).toString("hex").slice(0, size);
	return buf;
};

const checkToken = async (token) => {
	let account = await Account.findOne({
		where: {
			token,
		},
		attributes: ["username", "email", "role"],
	});

	if (account == null) return false;
	return account;
};

const updateToken = async (email) => {
	const token = generateToken();
	await Account.update(
		{ token },
		{
			where: {
				email,
			},
		}
	);

	return token;
};

module.exports = { checkToken, updateToken };
