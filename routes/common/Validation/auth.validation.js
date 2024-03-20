const {
    check,
    body,
} = require('express-validator');
const { validatedData } = require('../../../helper/helper');

module.exports = {
    userRegisterValidation: async function (req, res, next) {
        try {
            await check('email', 'Invalid email')
                .if(body('phone_number').not().exists())
                .notEmpty().isEmail().trim().escape().run(req);

            await check('phone_number', 'Invalid phone_number')
                .if(body('email').not().exists())
                .notEmpty().isMobilePhone().trim().escape().run(req);

            await check('role', 'Invalid role').notEmpty().isIn([1, 2]).trim().escape().run(req);

            await check('first_name', 'Invalid first_name').isString().notEmpty().trim().escape().run(req);

            await check('last_name', 'Invalid last_name').isString().notEmpty().trim().escape().run(req);
            await check('dob', 'Invalid dob').notEmpty().isDate().trim().escape().run(req);
            await check('address', 'Invalid address').isString().notEmpty().trim().escape().run(req);
            await check('city', 'Invalid city').isString().notEmpty().trim().escape().run(req);
            await check('state', 'Invalid state').isString().notEmpty().trim().escape().run(req);
            await check('country', 'Invalid country').isString().notEmpty().trim().escape().run(req);
            await check('is_signed_agreements', 'Invalid is_signed_agreements').isString().notEmpty().trim().escape().run(req);

            await check('password', 'Invalid password').isString().notEmpty().trim().escape().run(req);
            await check('identity_doc', 'Invalid identity_doc')
                .custom((value, { req }) => {
                    if (req.files && Object.keys(req.files).length > 0) {
                        let rtn = true;
                        if (req.files.identity_doc.length) {
                            for (let itm of req.files.identity_doc) {
                                if (String(itm.mimetype).startsWith('image')) {
                                    continue;
                                } else {
                                    return false; // return "falsy" value to indicate invalid data
                                }
                            }
                            return rtn;
                        } else {
                            if (String(req.files.identity_doc.mimetype).startsWith('image')) {
                                return true; // return "non-falsy" value to indicate valid data"
                            } else {
                                return false; // return "falsy" value to indicate invalid data
                            }
                        }

                    }
                })
                .withMessage('Please only submit jpg documents.').run(req);

            await validatedData(req, res, next);
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
    userLoginValidation: async function (req, res, next) {
        try {
            await check('username', 'Invalid username')
                .if(body('id').not().exists())
                .notEmpty().trim().escape().run(req);

            await check('password', 'Invalid password')
                .if(body('id').not().exists())
                .notEmpty().isString().trim().escape().run(req);

            await validatedData(req, res, next);
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
    userForgotPasswordValidation: async function (req, res, next) {
        try {
            await check('email', 'Invalid email')
                .if(body('phone_number').not().exists())
                .notEmpty().isEmail().trim().escape().run(req);

            await check('phone_number', 'Invalid phone_number')
                .if(body('email').not().exists())
                .notEmpty().isString().trim().escape().run(req);

            await validatedData(req, res, next);
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
    userResetPasswordValidation: async function (req, res, next) {
        try {
            await body('password', 'Invalid Password').notEmpty().isLength({ min: 6 }).trim().escape().run(req);

            await body('otp', 'Invalid Otp').notEmpty().isAlphanumeric().trim().escape().run(req);

            await validatedData(req, res, next);
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
    userUpdateValidation: async function (req, res, next) {
        try {
            await check('email', 'Invalid email')
                .if(body('phone_number').not().exists())
                .notEmpty().isEmail().trim().escape().run(req);

            await check('phone_number', 'Invalid phone_number')
                .if(body('email').not().exists())
                .notEmpty().isMobilePhone().trim().escape().run(req);

            await check('role', 'Invalid role').notEmpty().isIn([1, 2]).trim().escape().run(req);

            await check('first_name', 'Invalid first_name').isString().notEmpty().trim().escape().run(req);

            await check('last_name', 'Invalid last_name').isString().notEmpty().trim().escape().run(req);
            await check('dob', 'Invalid dob').notEmpty().isDate().trim().escape().run(req);
            await check('address', 'Invalid address').isString().notEmpty().trim().escape().run(req);
            await check('city', 'Invalid city').isString().notEmpty().trim().escape().run(req);
            await check('state', 'Invalid state').isString().notEmpty().trim().escape().run(req);
            await check('country', 'Invalid country').isString().notEmpty().trim().escape().run(req);
            await validatedData(req, res, next);
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
    userUpdateKYCValidation: async function (req, res, next) {
        try {
            await check('identity_doc', 'Invalid identity_doc')
                .custom((value, { req }) => {
                    if (req.files && Object.keys(req.files).length > 0) {
                        let rtn = true;
                        if (req.files.identity_doc.length) {
                            for (let itm of req.files.identity_doc) {
                                if (String(itm.mimetype).startsWith('image')) {
                                    continue;
                                } else {
                                    return false; // return "falsy" value to indicate invalid data
                                }
                            }
                            return rtn;
                        } else {
                            if (String(req.files.identity_doc.mimetype).startsWith('image')) {
                                return true; // return "non-falsy" value to indicate valid data"
                            } else {
                                return false; // return "falsy" value to indicate invalid data
                            }
                        }
                    }
                })
                .withMessage('Please only submit jpg documents.').run(req);
            await validatedData(req, res, next);
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
    verifiyOTPValidation: async function (req, res, next) {
        try {
            await check('id', 'Invalid id').notEmpty().isMongoId().trim().escape().run(req);
            await body('otp', 'Invalid Otp').notEmpty().isAlphanumeric().trim().escape().run(req);

            await validatedData(req, res, next);
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
    resendVerificationCodeValidation: async function (req, res, next) {
        try {
            await check('id', 'Invalid id').notEmpty().isMongoId().trim().escape().run(req);

            await validatedData(req, res, next);
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
}