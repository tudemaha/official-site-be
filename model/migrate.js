const sequelize = require("./connection");
require("./models");

const initialMigrate = async () => {
  console.log("INFO initialMigrate: starting migration");
  try {
    await sequelize.sync({ force: false });
    console.log("INFO initialMigrate: models migrated successfully");
    sequelize.close();
  } catch (error) {
    console.log("ERROR initialMigrate fatal error: ", error);
  }
};

module.exports = initialMigrate;
