const {
    check,
} = require('express-validator');
const { validatedData } = require('../helper/helper');

module.exports = {
    loginValidation: async function (req, res, next) {
        try {
            await check('email', 'Invalid email address').not().isEmpty().isEmail().trim().escape().run(req);

            await check('password', 'Invalid password').isString().not().isEmpty().trim().escape().run(req);

            await validatedData(req, res, next);
        } catch (error) {
            return res.json({ message: 'server Error' });
        }
    },
    registerValidation: async function (req, res, next) {
        try {
            await check('firstName', 'Invalid firstName').isString().not().isEmpty().trim().escape().run(req);

            await check('lastName', 'Invalid lastName').isString().not().isEmpty().trim().escape().run(req);

            await check('email', 'Invalid email').not().isEmpty().isEmail().trim().escape().run(req);

            await check('password', 'Invalid password').isString().not().isEmpty().trim().escape().run(req);

            await validatedData(req, res, next);
        } catch (error) {
            return res.json({ message: 'server Error' });
        }
    },

}