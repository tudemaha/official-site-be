const Joi = require('joi');

const signupValidation = Joi.object({
    username: Joi.string().
        alphanum().
        min(5).
        max(15).
        required(),
    
    email: Joi.string().
        email({minDomainSegments: 2}).
        required(),

    password: Joi.string().
        min(8).
        required(),

    repeat_password: Joi.ref('password')
}).with('password', 'repeat_password');

const signupValidator = (body) => {
    let errors = signupValidation.validate(body, {abortEarly: false}).error;
    if(errors != undefined) {
        let errorList = errors.details.map((error) => error.message);
        return errorList;
    }
    return [];
}

module.exports = signupValidator