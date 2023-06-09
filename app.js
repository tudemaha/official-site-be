const express = require("express");
require("dotenv").config();

const initialMigrate = require("./model/migrate");
const accountRouter = require("./routes/account");
const profileRouter = require("./routes/profile");

// initialMigrate()

const app = express();
app.use(express.json());
app.use("/account", accountRouter);
app.use("/profile", profileRouter);

app.listen(process.env.PORT, () => {
	console.log(`app is listening on port http://localhost:${process.env.PORT}`);
});
