const passport = require('passport');
const { isLogin } = require('../../middleware/checkLogin');
const { userList, userEdit, userDelete, userUpdate, userAdd } = require('../../controllers/admin/User.controller');
const { userEditValidation, userDeleteValidation, userUpdateValidation, userAddValidation, userListValidation } = require('./Validation/user.validation');


module.exports = async function (router) {
    router.get('/admin/users/', [isLogin, userListValidation], userList);
    router.post('/admin/users/add', [isLogin, userAddValidation], userAdd);
    router.get('/admin/users/edit/:id?', [isLogin, userEditValidation], userEdit);
    router.post('/admin/users/update/:id', [isLogin, userUpdateValidation], userUpdate);
    router.get('/admin/users/remove/:id', [isLogin, userDeleteValidation], userDelete);
};

