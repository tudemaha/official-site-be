const express = require("express");
const multer = require("multer");
const {
	readProfileHandler,
	editProfileHandler,
	editImageHandler,
	searchProfileHandler,
} = require("../controller/profile_controller");

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

router.get("/", searchProfileHandler);
router.get("/:username", readProfileHandler);
router.put("/:username", editProfileHandler);
router.put("/:username/image", upload.single("image"), editImageHandler);

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
