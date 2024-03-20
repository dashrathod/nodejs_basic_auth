module.exports = {
    isLogin: (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            return res.redirect('/admin/login');
        }
    },
    isLogout: (req, res, next) => {
        if (!req.isAuthenticated()) {
            next();
        } else {
            return res.redirect('/admin/dashboard');
        }
    }
}