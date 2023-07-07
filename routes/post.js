const express = require("express");
const multer = require("multer");
const {
	createPostHandler,
	getPostHandler,
	getPostDetailHandler,
	deletePostHandler,
	editPostHandler,
	addViewHandler,
} = require("./../controller/post_controller");

const { Post } = require("./../model/models");
const sequelize = require("./../model/connection");

const router = express.Router();

const upload = multer({
	limits: {
		fileSize: 1000000,
	},
	fileFilter: (req, file, cb) => {
		const validMimeType = [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
			"image/svg+xml",
		];

		if (!validMimeType.includes(file.mimetype)) {
			cb(new Error("invalid file type"));
		}
		cb(null, true);
	},
	storage: multer.memoryStorage(),
});

router.post("/create", upload.single("image"), createPostHandler);
router.get("/:username/:slug", getPostDetailHandler);
router.get("/:username", getPostHandler);
router.delete("/:slug", deletePostHandler);
router.put("/:slug", upload.single("image"), editPostHandler);
router.patch("/:slug", addViewHandler);

router.use((err, req, res, next) => {
	res.status(400).json({
		status: false,
		code: 400,
		message: "input not valid",
		data: {
			errors: [err.message],
		},
	});
});

module.exports = router;
