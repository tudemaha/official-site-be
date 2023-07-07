const express = require("express");
const {
	getSuperDetailHandler,
	getAllAccountHandler,
	editRoleHandler,
} = require("./../controller/super_controller");

router = express.Router();

router.get("/detail", getSuperDetailHandler);
router.get("/account", getAllAccountHandler);
router.patch("/account/:username", editRoleHandler);

module.exports = router;
