const express = require("express");
const cors = require("cors");
require("dotenv").config();

const initialMigrate = require("./model/migrate");
const createSuperAdmin = require("./model/seeder");
const accountRouter = require("./routes/account");
const postRouter = require(".//routes/post");
const profileRouter = require("./routes/profile");
const threadRouter = require("./routes/thread");

// initialMigrate();
// createSuperAdmin();

const app = express();
app.use(express.json());
app.use("/images", express.static("images"));

const corsOptions = {
	exposedHeaders: ["Authorization"],
};

app.use(cors(corsOptions));

app.use("/account", accountRouter);
app.use("/profile", profileRouter);
app.use("/post", postRouter);
app.use("/thread", threadRouter);

app.listen(process.env.PORT, () => {
	console.log(`app is listening on port http://localhost:${process.env.PORT}`);
});
