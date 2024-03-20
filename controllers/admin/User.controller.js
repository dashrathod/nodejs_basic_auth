const { qrCodeGenerate } = require("../../helper/helper");
const { listUsers } = require("../../services/user.service");

module.exports = {
    userList: async (req, res, next) => {
        try {
            let { search_string, document_by, order_by } = req.query;
            req.query.role = 1;
            let dataList = await listUsers(req.query);
            let renderData = {
                title: "User",
                activeSidebar: "User",
                dataList,
                search_string,
                document_by,
                order_by,
            }
            return res.render('admin/users/userslist', { ...renderData });
        } catch (error) {
            req.flash('error', 'Something went wrong.');
            return res.redirect('/admin');
        }
    },
    userEdit: async (req, res, next) => {

        try {
            let { id } = req.params;

            let userData = {};
            if (id) {
                userData = await userModel.aggregate([
                    { $match: { _id: new mongoObjectId(id) } },
                    {
                        $lookup: {
                            from: "usersdocuments",
                            localField: "_id",
                            foreignField: "user_id",
                            as: "document_detail"
                        }
                    }
                ]);
                userData = userData.shift();
                /* if (userData.dob) {
                    userData.dob = new Date(userData.dob);
                } */

                // res.locals.successMsg = `User detail getting successfully.`;
                if (userData.role == 2 && (!userData.qr_data || !userData.qr_url)) {
                    let qr_url = `${process.env.SERVER_URL}/productlist/${btoa(String(userData._id))}?hname=${userData.first_name} ${userData.last_name}`;
                    let qr_data = await qrCodeGenerate({
                        qrData: qr_url
                    });
                    await userModel.updateOne({ _id: new mongoObjectId(id) }, {
                        qr_data,
                        qr_url,
                    });
                    userData.qr_data = qr_data;
                    userData.qr_url = qr_url;
                }
                if (userData.phone_number) {
                    if (userData.phone_number[0] == '+') {
                        userData.phone_number = userData.phone_number.replace('+', '');
                    }
                    if (userData.phone_number[0] == '1') {
                        userData.phone_number = userData.phone_number.replace('1', '');
                    }
                }
            }

            if (userData.role == 1) {
                let renderData = {
                    title: "User Edit",
                    activeSidebar: "User",
                    id,
                    userData,
                }
                return res.render('admin/users/usersEdit', { ...renderData });
            }
            else {
                let renderData = {
                    title: "Host Edit",
                    activeSidebar: "Host",
                    id,
                    userData,
                }
                return res.render('admin/users/usersEdit', { ...renderData });
            }

        } catch (error) {
            res.locals.errorMsg = `Something Went Wrong`;
            req.flash('error', 'Something went wrong.');
            return res.redirect('/admin/users/');
            console.log(error);
        }
    },
    userUpdate: async (req, res, next) => {
        try {

            let { id } = req.params;

            let userData = await userModel.findOne({
                // _id: new mongoObjectId(id)
                _id: id
            });

            let updateData = req.body;
            if (updateData.password == '') {
                delete updateData.password;
            }
            if (userData) {
                if (req.body.phone_number) {
                    updateData.phone_number = updateData.phone_number.replace(/[() -]/g, '');
                }
                await userModel.updateOne({ _id: new mongoObjectId(id) }, updateData);
            }
            if (req.body.role == '1') {
                req.flash('success', 'Update Successfully.');
                return res.redirect('/admin/users/');
            }
            else {
                req.flash('success', 'Update Successfully.');
                return res.redirect('/admin/hosts/');
            }

        } catch (error) {
            req.flash('error', 'Something went wrong.');
            return res.redirect('/admin/users/');
            console.log(error);
        }
    },
    userAdd: async (req, res, next) => {
        try {
            if (req.body.phone_number) {
                req.body.phone_number = req.body.phone_number.replace(/[() -]/g, '');
            }
            let user = await userModel.create(req.body);
            if (user && req.body.role == 2) {
                let qr_url = `${process.env.SERVER_URL}/productlist/${btoa(String(user._id))}?hname=${user.first_name} ${user.last_name}`;
                user.qr_data = await qrCodeGenerate({
                    qrData: qr_url
                });
                user.qr_url = qr_url;
                await user.save();
            }
            if (req.body.role == '1') {
                req.flash('success', 'Added Successfully.');
                return res.redirect('/admin/users/');
            }
            else {
                req.flash('success', 'Added Successfully.');
                return res.redirect('/admin/hosts/');
            }
        } catch (error) {
            req.flash('error', 'Something went wrong.');
            return res.redirect('/admin/users/');
            console.log(error);
        }
    },
    userDelete: async (req, res, next) => {
        try {

            let { id } = req.params;

            await userModel.deleteOne({
                // _id: new mongoObjectId(id)
                _id: id
            });

            await usersDocumentsModel.deleteMany({
                // _id: new mongoObjectId(id)
                user_id: id
            });

            req.flash('success', 'Deleted Successfully.');
            return res.redirect('back');
        } catch (error) {
            req.flash('error', 'Something went wrong.');
            return res.redirect('/admin/users/');
            console.log(error);
        }
    }
}