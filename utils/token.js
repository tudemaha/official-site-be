const crypto = require("crypto");
const { Account } = require("../model/models");

const generateToken = (size = 64) => {
	const buf = crypto.randomBytes(size).toString("hex").slice(0, size);
	return buf;
};

const checkToken = async (token) => {
	let account = await Account.findAll({
		where: {
			token,
		},
		attributes: ["username", "email"],
	});

	if (account.length == 0) return false;
	return account[0];
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
