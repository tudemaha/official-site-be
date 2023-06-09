const express = require("express");
const {
	readProfileHandler,
	editProfileHandler,
} = require("../controller/profile_controller");

const router = express.Router();

router.get("/:username", readProfileHandler);
router.put("/:username", editProfileHandler);

module.exports = router;
