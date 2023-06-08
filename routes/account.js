const express = require('express');
const { signupHandler } = require('./../controller/account_controller');
const { loginValidator } = require('./../utils/validation')
const { checkBcrypt } = require('./../utils/bcrypt')
const { Account } = require('./../model/models')

const router = express.Router();
router.use(express.json())

router.post('/signup', signupHandler);
router.post('/login', async (req, res) => {
    let reqBody = req.body;

    const reqErrors = loginValidator(reqBody);
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

    let account = await Account.findAll({
        where: {
            email: reqBody.email
        },
        attributes: ['username', 'email', 'password']
    });
    
    if(account.length === 0) {
        res.status(404).json({
            status: false,
            code: 404,
            message: 'data not found',
            data: {
                errors: [
                    "email or password incorrect"
                ]
            }
        });
        return;
    }
    account = account[0];
    
    let passStatus = await checkBcrypt(account.password, reqBody.password);
    if(!passStatus) {
        res.status(404).json({
            status: false,
            code: 404,
            message: 'data not found',
            data: {
                errors: [
                    "email or password incorrect"
                ]
            }
        });
        return;
    }
    
});

module.exports = router;