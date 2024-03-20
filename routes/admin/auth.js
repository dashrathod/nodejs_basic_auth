const passport = require('passport');
const { isLogin, isLogout } = require('../../middleware/checkLogin');
const { loginValidation } = require('../../middleware/userValidation.js');
const { userUpdateValidation } = require('./Validation/user.validation');
const { adminUpdate } = require('../../controllers/admin/Authorization');


module.exports = async function (router) {
    router.get('/admin/dashboard', isLogin, function (req, res, next) {
        return res.render('admin/dashboard', { title: 'Dashboard', activeSidebar: 'Dashboard', usersProfile: req.user });
    });

    router.get('/admin/profile', isLogin, function (req, res, next) {
        return res.render('admin/profile', { title: 'Profile', activeSidebar: 'Dashboard', usersProfile: req.user });
    });

    router.post('/admin/update/:id', [isLogin, userUpdateValidation], adminUpdate);

    router.get('/admin/login', isLogout, async function (req, res, next) {
        let login_errors = req.session.messages || []
        res.locals.errorMsg = (req.session.messages) ? req.session.messages[0] : '';
        req.session.messages = [];
        return res.render('admin/login', { title: 'Login', login_errors: login_errors });
    });

    router.post('/admin/login', [loginValidation], passport.authenticate('admin-signup', {
        successRedirect: "/admin/dashboard",
        failureRedirect: "/admin/login",
        failureMessage: true,
        session: true,
        successMessage: true,
        // failureFlash: true,
    }));

    router.get('/admin/logout', isLogin, async function (req, res, next) {
        req.logOut(() => {
            return res.redirect('/admin/login');
        });
    });

    router.get('/admin/', function (req, res, next) {
        return res.redirect('/admin/dashboard');
    });
};

