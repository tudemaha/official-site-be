const express = require("express");
const { readProfileHandler } = require("../controller/profile_controller");
const { Profile, Account } = require("./../model/models");

const router = express.Router();

router.get("/:username", readProfileHandler);

module.exports = router;
