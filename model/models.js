const { DataTypes } = require("sequelize");
const sequelize = require("./connection");

const Account = sequelize.define(
	"Account",
	{
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				max: 15,
			},
			unique: true,
			primaryKey: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				max: 150,
			},
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		token: {
			type: DataTypes.STRING,
			defaultValue: null,
		},
	},
	{
		tableName: "accounts",
	}
);

const Profile = sequelize.define(
	"Profile",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true,
		},
		name: DataTypes.STRING,
		position: DataTypes.STRING,
		grade: DataTypes.STRING,
		education: DataTypes.STRING,
		address: DataTypes.STRING,
		image: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "default.png",
		},
	},
	{
		tableName: "profiles",
	}
);

const Post = sequelize.define(
	"Post",
	{
		slug: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		image: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
	},
	{
		tableName: "posts",
	}
);

Account.hasOne(Profile);
Profile.belongsTo(Account, {
	onUpdate: "CASCADE",
	onDelete: "CASCADE",
});

Account.hasMany(Post);
Post.belongsTo(Account, {
	onUpdate: "CASCADE",
});

module.exports = { Account, Profile, Post };
