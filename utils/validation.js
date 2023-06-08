const Joi = require("joi");

const signupValidation = Joi.object({
  username: Joi.string().alphanum().min(5).max(15).required(),

  email: Joi.string().email({ minDomainSegments: 2 }).required(),

  password: Joi.string().min(8).required(),

  repeat_password: Joi.ref("password"),
}).with("password", "repeat_password");

const loginValidation = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),

  password: Joi.string().min(8).required(),
});

const getErrorList = (errors) => {
  if (errors != undefined) {
    let errorList = errors.details.map((error) => error.message);
    return errorList;
  }
  return [];
};

const signupValidator = (body) => {
  let errors = signupValidation.validate(body, { abortEarly: false }).error;
  return getErrorList(errors);
};

const loginValidator = (body) => {
  let errors = loginValidation.validate(body, { abortEarly: false }).error;
  return getErrorList(errors);
};

module.exports = { signupValidator, loginValidator };
