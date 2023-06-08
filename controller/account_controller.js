const { Account } = require("./../model/models");
const { createBcrypt, checkBcrypt } = require("./../utils/bcrypt");
const generateToken = require("./../utils/token");
const { signupValidator, loginValidator } = require("../utils/validation");

const signupHandler = async (req, res) => {
  const reqBody = req.body;

  const reqErrors = signupValidator(reqBody);
  if (reqErrors.length != 0) {
    res.status(406).json({
      status: false,
      code: 406,
      message: "input not valid",
      data: {
        errors: reqErrors,
      },
    });
    return;
  }

  const passwordHash = await createBcrypt(reqBody.password);

  const result = Account.create({
    username: reqBody.username,
    email: reqBody.email,
    password: passwordHash,
  });

  result
    .then(() => {
      res.status(201).json({
        status: true,
        code: 201,
        message: "signup success",
        data: null,
      });
    })
    .catch((err) => {
      res.status(409).json({
        status: false,
        code: 409,
        message: "conflict data input",
        data: {
          errors: [err.errors[0].message],
        },
      });
    });
};

const loginHandler = async (req, res) => {
  let reqBody = req.body;

  const reqErrors = loginValidator(reqBody);
  if (reqErrors.length != 0) {
    res.status(400).json({
      status: false,
      code: 400,
      message: "input not valid",
      data: {
        errors: reqErrors,
      },
    });
    return;
  }

  let account = await Account.findAll({
    where: {
      email: reqBody.email,
    },
    attributes: ["username", "email", "password"],
  });

  if (account.length === 0) {
    res.status(404).json({
      status: false,
      code: 404,
      message: "data not found",
      data: {
        errors: ["email or password incorrect"],
      },
    });
    return;
  }
  account = account[0];

  let passStatus = await checkBcrypt(account.password, reqBody.password);
  if (!passStatus) {
    res.status(404).json({
      status: false,
      code: 404,
      message: "data not found",
      data: {
        errors: ["email or password incorrect"],
      },
    });
    return;
  }

  const token = generateToken(64);
  await Account.update(
    { token },
    {
      where: {
        email: account.email,
      },
    }
  );

  res.set("Authorization", `Bearer ${token}`);
  res.status(200).json({
    status: true,
    code: 200,
    messsage: "login success",
    data: null,
  });
};

module.exports = { signupHandler, loginHandler };
