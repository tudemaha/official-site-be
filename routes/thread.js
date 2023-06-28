const express = require("express");
const router = express.Router();

const {
	createThreadController,
	createCommentController,
	getThreadController,
	getCommentController,
	updateThreadStatusController,
} = require("../controller/thread_controller");

router.post("/create", createThreadController);
router.post("/comment", createCommentController);
router.get("/:slug", getThreadController);
router.get("/comment/:id", getCommentController);
router.put("/:id", updateThreadStatusController);

module.exports = router;
