const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtConfigHelper = require('../../configuration/jwtConfigHelper');
const mongoose = require('mongoose');
const { uploadDocumentImage, generatePassword, sendEmail, qrCodeGenerate } = require('../../helper/helper');
const fs = require("fs");
const { sendVerification, sendWelcomeMail } = require('../../services/user.service');

module.exports = {
    userRegister: async (req, res, next) => {
        try {
            let user = await userModel.create(req.body);
            if (user) {
                let curId = user._id;
                if (req.body.role == 2) {
                    let qr_url = `${process.env.SERVER_URL}/productlist/${btoa(String(curId))}?hname=${user.first_name} ${user.last_name}`;
                    user.qr_data = await qrCodeGenerate({
                        qrData: qr_url,
                    });
                    user.qr_url = qr_url;
                    await user.save();
                }
                let images = await uploadDocumentImage({ req, inputName: 'identity_doc', curId, saveDir: "/documents/users" });
                for (let itm of images) {
                    let path = '';
                    if (itm) {
                        path = `/documents/users/${curId}/${itm}`;
                    }
                    await usersDocumentsModel.create({
                        user_id: curId,
                        path: path,
                    });
                }
                await sendVerification({ user });
                return responseHelper.successWithData(res, 'Verification Otp sended.', { id: user._id });
            } else {
                return responseHelper.error(res, 'Register Error.');
            }
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                return responseHelper.error(res, error.message);
            }
            return responseHelper.serverError(res, error);
        }
    },
    userLogin: async (req, res, next) => {
        try {
            passport.authenticate('user-signIn', { session: false }, (err, user, info) => {
                if (err || !user) {
                    if (err instanceof mongoose.Error.ValidationError) {
                        return responseHelper.error(res, err.message, 400);
                    }
                    return responseHelper.error(res, info?.message || 'Something missing', 400);
                }
                req.login(user, { session: false }, async (err) => {
                    if (err) {
                        return responseHelper.error(res, 'Error in Login')
                    }
                    // generate a signed son web token with the contents of user object and return it in the response
                    //create jwt token
                    let token = jwt.sign({
                        userId: user._id,
                        _id: user._id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email || undefined,
                        phone_number: user.phone_number || undefined,
                    }, jwtConfigHelper.jwtAuthKey.secret, {
                        expiresIn: jwtConfigHelper.jwtAuthKey.tokenLife
                    });
                    return responseHelper.successWithData(res, 'Login successfully.', { token, user });
                });
            })(req, res);
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
    userForgotPassword: async (req, res, next) => {
        try {
            let condition = {};
            if (req.body.email) {
                condition = { email: req.body.email };
            } else if (req.body.phone_number) {
                // condition = { phone_number: req.body.phone_number };
                condition = {
                    "$or": [
                        { phone_number: req.body.phone_number },
                        { phone_number: `+${req.body.phone_number}` },
                        { phone_number: `+1${req.body.phone_number}` },
                    ]
                };
            }

            let userData = await userModel.findOne({
                ...condition
            });
            if (userData) {
                userData.verification = {
                    otp: generatePassword(4),
                    expire: new Date(+new Date() + 1 * 60 * 1000), //1 minute
                };
                console.log(userData.verification);
                await userData.save();
                if (req.body.email) {
                    //send mail to admin
                    sendEmail({
                        to: req.body.email,
                        sub: "Forgort Password OTP",
                        text: "",
                        viewFileName: `userForgotPassword.ejs`,
                        attachment: "",
                        data: userData
                    });
                }
                return responseHelper.correct(res, { message: "Please verify otp." });
            } else {
                return responseHelper.failed(res, { success: false, message: 'Not Valid User' });
            }
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
    userResetPassword: async (req, res, next) => {
        try {
            let userData = await userModel.findOne({ "verification.otp": req.body.otp, "verification.expire": { $gte: new Date() } });
            if (userData) {
                let updateData = {
                    password: req.body.password,
                    verification: {
                        otp: 'verified',
                        expire: new Date()
                    }
                }
                let updated_admin_data = await userModel.findOneAndUpdate({ _id: userData._id }, updateData, { new: true });
                if (!updated_admin_data) {
                    return responseHelper.failed(res, { success: false, resp_code: { MSG: "Details not founded." } });
                } else {
                    return responseHelper.correct(res, { admin_data: updated_admin_data, message: "Password reset successfully." });
                }
            } else {
                return responseHelper.failed(res, { success: false, resp_code: { MSG: "Details not founded." } });
            }
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
    userProfile: async (req, res, next) => {
        try {
            return responseHelper.successWithData(res, 'Get profile successfully.', { login_user: req.user });
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
    userUpdateProfile: async (req, res, next) => {
        try {
            let id = req.user.id;
            if (req.body.email) {
                let isExists = await userModel.findOne({ email: req.body.email, _id: { $ne: new mongoObjectId(id) } });
                if (isExists) {
                    return responseHelper.error(res, 'Email already exists.');
                }
            }
            if (req.body.phone_number) {
                let isExists = await userModel.findOne({ phone_number: req.body.phone_number, _id: { $ne: new mongoObjectId(id) } });
                if (isExists) {
                    return responseHelper.error(res, 'phone_number already exists.');
                }
            }
            let user = await userModel.findOneAndUpdate({ _id: new mongoObjectId(id) }, req.body);
            if (user) {
                return responseHelper.successWithData(res, 'Update successfully.', {});
            } else {
                return responseHelper.error(res, 'Updation Error.');
            }
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
    userUpdateKYCProfile: async (req, res, next) => {
        try {
            let id = req.user.id;
            let user = await userModel.findOneAndUpdate({ _id: new mongoObjectId(id) }, { is_document_verified: false });
            if (user) {
                //#region remove old doc file
                if (req.files && Object.keys(req.files).length > 0) {
                    let oldDocs = await usersDocumentsModel.find({ user_id: new mongoObjectId(id) });
                    for (let itm of oldDocs) {
                        if (itm.path) {
                            if (fs.existsSync(`${process.cwd()}${itm.path}`)) {
                                fs.unlinkSync(`${process.cwd()}${itm.path}`);
                            } else {
                                console.error(`${itm.path} -- user file not found!`);
                            }
                        }
                        await usersDocumentsModel.deleteOne({
                            _id: itm._id,
                        });
                    }
                }
                //#endregion

                //#region add newest doc file
                let curId = user._id;
                let images = await uploadDocumentImage({ req, inputName: 'identity_doc', curId, saveDir: "/documents/users" });
                for (let itm of images) {
                    if (itm) {
                        await usersDocumentsModel.create({
                            user_id: curId,
                            path: `/documents/users/${curId}/${itm}`,
                        });
                    }
                }
                //#endregion

                return responseHelper.successWithData(res, 'Update successfully.', {});
            } else {
                return responseHelper.error(res, 'Updation Error.');
            }
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
    verifiyOTP: async (req, res, next) => {
        try {
            let userData = await userModel.findOne({
                "_id": new mongoObjectId(req.body.id),
                "verification.otp": req.body.otp,
                "verification.expire": { $gte: new Date() }
            });
            if (userData) {
                req.body.verification = { otp: 'verified', expire: new Date() };
                req.body.is_verified = true;
                let updated_admin_data = await userModel.findOneAndUpdate({ _id: userData._id }, req.body, { new: true });
                if (!updated_admin_data) {
                    return responseHelper.failed(res, { success: false, resp_code: { MSG: "Details not founded." } });
                } else {
                    await sendWelcomeMail({ user: userData });
                    return responseHelper.successWithData(res, 'OTP verified successfully.', {});
                }
            } else {
                return responseHelper.failed(res, { success: false, resp_code: { MSG: "Details not founded." } });
            }
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
    resendVerificationCode: async (req, res, next) => {
        try {
            let userData = await userModel.findOne({
                "_id": new mongoObjectId(req.body.id),
                is_document_verified: false,
                is_verified: false,
                account_status: 'disabled',
            });
            if (userData) {
                await sendVerification({ user: userData });
                return responseHelper.successWithData(res, 'Verification Otp sended.', { id: userData._id });
            } else {
                return responseHelper.failed(res, { success: false, resp_code: { MSG: "Details not founded." } });
            }
        } catch (error) {
            return responseHelper.serverError(res, error);
        }
    },
}