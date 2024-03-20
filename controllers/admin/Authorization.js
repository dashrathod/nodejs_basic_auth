module.exports = {
    adminUpdate: async (req, res, next) => {
        try {
            let { id } = req.params;

            let userData = await adminModel.findOne({
                // _id: new mongoObjectId(id)
                _id: id
            });
            if (userData) {
                let data = await adminModel.findByIdAndUpdate(new mongoObjectId(id), req.body, { new: true });
                req.session.passport.user = data;
                await req.session.save();
            }

            req.flash('success', 'Update Successfully.');
            return res.redirect('/admin/profile');
        } catch (error) {
            req.flash('error', 'Something went wrong.');
            return res.redirect('/admin');
            console.log(error);
        }
    },
}