const { userRegister, userLogin, userForgotPassword, userResetPassword, userProfile, userUpdateProfile, userUpdateKYCProfile, verifiyOTP, resendVerificationCode } = require("../../controllers/common/Authorization");
const { userRegisterValidation, userLoginValidation, userForgotPasswordValidation, userResetPasswordValidation, userUpdateValidation, userUpdateKYCValidation, verifiyOTPValidation, resendVerificationCodeValidation } = require("./Validation/auth.validation");

module.exports = async function (router) {
    router.post('/register', [userRegisterValidation], userRegister);
    router.post('/verify_otp', [verifiyOTPValidation], verifiyOTP);
    router.post('/resend_verification_code', [resendVerificationCodeValidation], resendVerificationCode);
    router.post('/login', [userLoginValidation], userLogin);
    router.post('/forgot_password', [userForgotPasswordValidation], userForgotPassword);
    router.post('/reset_password', [userResetPasswordValidation], userResetPassword);
    // router.get('/profile', [passport.authenticate('jwt'), isJWTVerified], userProfile);
    router.get('/profile', [isJWTVerified], userProfile);
    router.post('/update_profile', [isJWTVerified, userUpdateValidation], userUpdateProfile);
    router.post('/update_kyc', [isJWTVerified, userUpdateKYCValidation], userUpdateKYCProfile);
};

