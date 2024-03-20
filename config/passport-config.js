// const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const jwtConfigHelper = require('../configuration/jwtConfigHelper.js');

module.exports = function (passport) {


    passport.serializeUser(function (user, done) {
        // done(null, user.id);
        done(null, user);
    });

    /* passport.deserializeUser(function (id, done) {
        return adminModel.findOne({ _id: id })
            .then(async user => {
                if (!user) {
                    return done(null, {});
                } else {
                    return done(null, user);
                }
            })
            .catch(err => done(err));
    }); */

    passport.deserializeUser(function (user, cb) {
        process.nextTick(function () {
            return cb(null, user);
        });
    });

    passport.use('admin-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, cb) {
            //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
            return adminModel.findOne({ email: email })
                .then(async user => {
                    if (!user) {
                        req.flash('error', 'Incorrect email or password.');
                        return cb(null, false, { message: 'Incorrect email or password.' });
                    } else if (!await user.validatePassword(password)) {
                        req.flash('error', 'Incorrect email or password.');
                        return cb(null, false, { message: 'Incorrect email or password.' });
                    } else {
                        req.flash('success', 'Logged In Successfully.');
                        return cb(null, user, { message: 'Logged In Successfully' });
                    }
                })
                .catch(err => cb(err));
        }
    ));

    passport.use('user-signIn', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, username, password, cb) {
            //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
            return userModel.findOne({
                // is_verified: true,
                // is_document_verified: true,
                "$or": [
                    { email: { '$regex': username.replace('+', ''), $options: 'i' } },
                    { phone_number: username },
                    { phone_number: `+${username}` },
                    { phone_number: `+1${username}` },
                    { "_id": new mongoObjectId(req.body.id) }
                ]
            }).then(async user => {
                if (!user) {
                    return cb(null, false, { message: 'Incorrect username or password.' });
                } else if (!req.body.id && !await user.validatePassword(password)) {
                    return cb(null, false, { message: 'Incorrect username or password.' });
                } else if (!user.is_verified || !user.is_document_verified) {
                    return cb(null, false, { message: 'We are working to verify your account. Please be patient and try again in a couple of hours. Thanks!' });
                } else {
                    if (!req.body.id && req.body.id != user._id) {
                        user.login_at = new Date();
                        await user.save();
                    }
                    return cb(null, user, { message: 'Logged In Successfully' });
                }
            }).catch(err => cb(err));
        }
    ));

    passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtConfigHelper.jwtAuthKey.secret || process.env.jwtSecret || 'your_jwt_secret'
    },
        function (jwtPayload, cb) {
            //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
            return userModel.findById(jwtPayload._id)
                .then(async user => {
                    if (!user) {
                        return cb(null, false, { message: 'Incorrect email or password.' });
                    } else {
                        if (!user || !user.is_document_verified || !user.is_verified) {
                            return cb(null, false, { message: 'We are working to verify your account. Please be patient and try again in a couple of hours. Thanks!' });
                        }
                        return cb(null, user, { message: 'Logged In Successfully' });
                    }
                })
                .catch(err => cb(err));

        }
    ));
}