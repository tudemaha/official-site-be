const express = require("express");
const {
  signupHandler,
  loginHandler,
} = require("./../controller/account_controller");
const { Account } = require("./../model/models");
const generateToken = require("./../utils/token");

const router = express.Router();
router.use(express.json());

router.post("/signup", signupHandler);
router.post("/login", loginHandler);

module.exports = router;
