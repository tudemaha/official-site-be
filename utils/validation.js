const Joi = require("joi");

const signupValidation = Joi.object({
	username: Joi.string().alphanum().min(5).max(15).required(),

	email: Joi.string().email({ minDomainSegments: 2 }).required(),

	password: Joi.string().min(8).required(),

	password_repeat: Joi.ref("password"),
}).with("password", "password_repeat");

const loginValidation = Joi.object({
	email: Joi.string().email({ minDomainSegments: 2 }).required(),

	password: Joi.string().min(8).required(),
});

const editPasswordValidation = Joi.object({
	email: Joi.string().email({ minDomainSegments: 2 }).required(),

	old_password: Joi.string().min(8).required(),

	new_password: Joi.string().min(8).required(),

	new_password_repeat: Joi.ref("new_password"),
}).with("new_password", "new_password_repeat");

const getErrorList = (errors) => {
	if (errors != undefined) {
		let errorList = errors.details.map((error) => error.message);
		return errorList;
	}
	return [];
};

const signupValidator = (body) => {
	const errors = signupValidation.validate(body, { abortEarly: false }).error;
	return getErrorList(errors);
};

const loginValidator = (body) => {
	const errors = loginValidation.validate(body, { abortEarly: false }).error;
	return getErrorList(errors);
};

const editPasswordValidator = (body) => {
	const errors = editPasswordValidation.validate(body, {
		abortEarly: false,
	}).error;
	return getErrorList(errors);
};

module.exports = { signupValidator, loginValidator, editPasswordValidator };
