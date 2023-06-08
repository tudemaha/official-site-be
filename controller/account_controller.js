const bcrypt = require('./../utils/bcrypt')
const { signupValidator } = require('../utils/validation');
const { Account } = require('./../model/models')

const signupHandler = async (req, res) => {
    const reqBody = req.body;
    
    const reqErrors = signupValidator(reqBody);
    if(reqErrors.length != 0) {
        res.status(406).json({
            status: false,
            code: 406,
            message: 'input not valid',
            data: {
                errors: reqErrors
            }
        });
        return;
    }

    const passwordHash = await bcrypt(reqBody.password)

    const result = Account.create({
        username: reqBody.username,
        email: reqBody.email,
        password: passwordHash
    });

    result.then(() => {
        res.status(201).json({
            status: true,
            code: 201,
            message: 'signup success',
            data: null
        })
    })
    .catch((err) => {
        res.status(409).json({
            status: false,
            code: 409,
            message: 'conflict data input',
            data: {
                errors: [err.errors[0].message]
            }
        })
    });
}

module.exports = { signupHandler };