const jwt = require('jsonwebtoken');
const jwtConfigHelper = require('./jwtConfigHelper.js');
const passport = require('passport');

//for user login check
function isUserLogin(req, res, next) {
    try {
        let token = req.headers.authorization || req.query.token;
        jwt.verify(token, jwtConfigHelper.jwtAuthKey.secret, async function (err, decoded) {
            if (err) {
                return responseHelper.error(res, "please login again.", 401);
            } else {
                req.loginUser = decoded;
                // req.userEx = decoded;
                var getUser = await userModel.findById(decoded._id);
                next();
            }
        });
        //  next();
    } catch (error) {
        return error;
    }
}

global.isUserLogin = isUserLogin;

function isJWTVerified(req, res, next) {
    try {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (err || !user) {
                return responseHelper.error(res, info.message, 401);
            }
            req.login(user, { session: false }, async (err) => {
                if (err) {
                    return responseHelper.error(res, 'Error in jwt verification.', 401)
                }
                next()
            });
        })(req, res, next)
        //  next();
    } catch (error) {
        return error;
    }
}

global.isJWTVerified = isJWTVerified;

function checkIsHost(req, res, next) {
    try {
        if (req.user && req.user.role != 2) { //check is valid for host
            return responseHelper.error(res, 'Your are not authorized.', 401)
        } else {
            next()
        }
        //  next();
    } catch (error) {
        return error;
    }
}

global.checkIsHost = checkIsHost;