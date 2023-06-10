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

const deleteAccountValidation = Joi.object({
	password: Joi.string().min(8).required(),
});

const editProfileValidation = Joi.object({
	name: Joi.string().min(3).max(255).required(),
	position: Joi.string().required(),
	grade: Joi.string().required(),
	education: Joi.string().required(),
	address: Joi.string().required(),
});

const createPostValidation = Joi.object({
	title: Joi.string().min(1).max(255).required(),
	content: Joi.string().required(),
});

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

const deleteAccountValidator = (body) => {
	const errors = deleteAccountValidation.validate(body, {
		abortEarly: false,
	}).error;
	return getErrorList(errors);
};

const editProfileValidator = (body) => {
	const errors = editProfileValidation.validate(body, {
		abortEarly: false,
	}).error;
	return getErrorList(errors);
};

const createPostValidator = (body) => {
	const errors = createPostValidation.validate(body, {
		abortEarly: false,
	}).error;
	return getErrorList(errors);
};

module.exports = {
	signupValidator,
	loginValidator,
	editPasswordValidator,
	deleteAccountValidator,
	editProfileValidator,
	createPostValidator,
};
