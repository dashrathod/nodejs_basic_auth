const {
    check,
    body,
    oneOf,
} = require('express-validator');
const { validatedData, validatedDataEjs } = require('../../../helper/helper');

module.exports = {
    userListValidation: async function (req, res, next) {
        try {
            await check('document_by', 'Invalid document_by').optional().isBoolean().toBoolean().run(req);
            await check('order_by', 'Invalid order_by').optional().isIn(['-1', '1']).run(req);

            await validatedDataEjs(req, res, next);
        } catch (error) {
            console.log(error);
            return res.json({ message: 'server Error' });
        }
    },
    userEditValidation: async function (req, res, next) {
        try {
            await check('id', 'Invalid id').optional().isMongoId().trim().escape().run(req);

            await validatedDataEjs(req, res, next);
        } catch (error) {
            console.log(error);
            return res.json({ message: 'server Error' });
        }
    },
    userUpdateValidation: async function (req, res, next) {
        try {
            await check('id', 'Invalid id').not().isEmpty().isMongoId().trim().escape().run(req);
            await check('first_name', 'Invalid first_name').not().isEmpty().isString().trim().escape().run(req);
            await check('last_name', 'Invalid last_name').not().isEmpty().isString().trim().escape().run(req);

            await oneOf([
                check('email', 'Invalid email')
                    // .if(body('phone_number').not().exists())
                    .notEmpty().isEmail().trim().escape()
                ,
                check('phone_number', 'Invalid phone_number')
                    // .if(body('email').not().exists())
                    .notEmpty().isMobilePhone().trim().escape()
            ], "Please Fill Email or Phone Number.").run(req);

            /* await check('email', 'Invalid email')
                .if(body('phone_number').not().exists())
                .notEmpty().isEmail().trim().escape().run(req);

            await check('phone_number', 'Invalid phone_number')
                .if(body('email').not().exists())
                .notEmpty().isMobilePhone().trim().escape().run(req); */

            // await check('password', 'Invalid password').optional().isString().trim().escape().run(req);

            await validatedDataEjs(req, res, next);
        } catch (error) {
            console.log(error);
            return res.json({ message: 'server Error' });
        }
    },
    userAddValidation: async function (req, res, next) {
        try {
            await check('first_name', 'Invalid first_name').not().isEmpty().isString().trim().escape().run(req);
            await check('last_name', 'Invalid last_name').not().isEmpty().isString().trim().escape().run(req);

            await oneOf([
                check('email', 'Invalid email')
                    // .if(body('phone_number').not().exists())
                    .notEmpty().isEmail().trim().escape()
                ,
                check('phone_number', 'Invalid phone_number')
                    // .if(body('email').not().exists())
                    .notEmpty().isMobilePhone().trim().escape()
            ], "Please Fill Email or Phone Number.").run(req);

            /* await check('email', 'Invalid email')
                .if(body('phone_number').not().exists())
                .notEmpty().isEmail().trim().escape().run(req);

            await check('phone_number', 'Invalid phone_number')
                .if(body('email').not().exists())
                .notEmpty().isMobilePhone().trim().escape().run(req); */

            // await check('password', 'Invalid password').not().isEmpty().isString().trim().escape().run(req);

            await validatedDataEjs(req, res, next);
        } catch (error) {
            console.log(error);
            return res.json({ message: 'server Error' });
        }
    },
    userDeleteValidation: async function (req, res, next) {
        try {
            await check('id', 'Invalid id').not().isEmpty().isMongoId().trim().escape().run(req);

            await validatedDataEjs(req, res, next);
        } catch (error) {
            return res.json({ message: 'server Error' });
        }
    },

}