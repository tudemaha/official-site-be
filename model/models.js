const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('./connection');

const Account = sequelize.define('Account', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            max: 15
        },
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            max: 150
        },
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: {
        type: DataTypes.STRING,
        defaultValue: null
    }
}, {
    tableName: 'accounts'
})

const Profile = sequelize.define('Profile', {
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
    address: DataTypes.STRING
}, {
    tableName: 'profiles'
})

const Post = sequelize.define('Post', {
    slug: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.BLOB('medium')
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'posts'
})

Profile.belongsTo(Account, {
    foreignKey: 'accountId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

Post.belongsTo(Account, {
    foreignKey: 'accountId',
    onUpdate: 'CASCADE'
});

module.exports = { Account, Profile, Post }