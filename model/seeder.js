require("dotenv").config();
const { Account, Profile } = require("./models.js");
const sequelize = require("./connection.js");
const { createBcrypt } = require("./../utils/bcrypt.js");

const createSuperAdmin = async () => {
	const passwordHash = await createBcrypt(process.env.SA_PASSWORD);

	const createTransaction = async (transaction) => {
		await Account.create(
			{
				username: process.env.SA_USERNAME,
				email: process.env.SA_EMAIL,
				password: passwordHash,
				role: 1,
			},
			{ transaction }
		);

		await Profile.create(
			{
				AccountUsername: process.env.SA_USERNAME,
			},
			{ transaction }
		);
	};

	sequelize
		.transaction(createTransaction)
		.then(() => {
			console.log("INFO createSuperAdmin: super admin created successfully");
		})
		.catch((err) => {
			console.log("ERROR createSuperAdmin: ", err);
		});
};

module.exports = createSuperAdmin;
