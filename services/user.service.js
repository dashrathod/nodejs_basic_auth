const { generatePassword, sendEmail } = require("../helper/helper");

module.exports = {
    listUsers: async (data) => {
        let { pagination, search_string, role, document_by, order_by = '-1' } = data;

        let matchData = {};
        if (role) {
            matchData['role'] = role;
        }

        if (typeof document_by == 'boolean') {
            matchData['is_document_verified'] = Boolean(document_by);
        }

        let page = parseInt(data.page) || 1;
        let options = {
            page: page,
            limit: 10,
            pagination: (typeof pagination) ? pagination : true,
            sort: { "created_at": parseInt(order_by) }
        };

        let lookup = {
            $lookup:
            {
                from: "usersdocuments",
                localField: "_id",
                foreignField: "user_id",
                as: "document_detail"
            }
        };
        /* let unwind = {
            $unwind: {
                "path": "$document_detail",
                "preserveNullAndEmptyArrays": true
            }
        }; */


        //for searching
        let search = { $match: {} };
        let addname = {
            $addFields: {
                nameFilter: {
                    $concat: ["$first_name", " ", "$last_name"],
                },
            },
        };
        if (search_string != undefined) {
            search_string = search_string.replace(/^\s+|\s+$/g, '');
            search_string = search_string.replace(/ +(?= )/g, '');

            /* if (search_string.indexOf(' ') != -1) {
                matchData["nameFilter"] = {
                    $regex: new RegExp(search_string.trim(), 'i'),
                    // $options: "i",
                };
            } */
            search = {
                "$match": {
                    $or: [
                        { "nameFilter": { $regex: new RegExp(search_string.trim(), 'i') } },
                        { "first_name": { $regex: new RegExp(search_string.trim(), 'i') } },
                        { "last_name": { $regex: new RegExp(search_string.trim(), 'i') } },
                        { "email": { $regex: new RegExp(search_string.trim(), 'i') } },
                        { "phone_number": { $regex: new RegExp(search_string.trim(), 'i') } },
                    ]
                }
            };
        }

        let userListQuery = userModel.aggregate([lookup, addname, search, { "$match": matchData },]);
        let dataList = await userModel.aggregatePaginate(userListQuery, options);
        return dataList;
    },
    sendVerification: async ({ user }) => {
        let otp = generatePassword(4);
        user.verification = {
            otp: otp,
            expire: new Date(+new Date() + 5 * 60 * 1000),// five minute
        };
        console.log(user.verification);
        await user.save();
        if (user.email) {
            //send mail to admin
            sendEmail({
                to: user.email,
                sub: "Verify Your Email",
                text: "",
                viewFileName: `userVerification.ejs`,
                attachment: "",
                data: user
            });
        } else if (user.phone_number) {
            let body = `Your verification OTP : ${otp}`;
            // await twilioSMS.send(body, user.phone_number)
        }
    },
    sendWelcomeMail: async ({ user }) => {
        if (user.email) {

            let sub, viewFileName = "";
            sub = "Welcome to nodejs_basic_auth – Let’s Find New Boundaries";
            viewFileName = `welcome.ejs`;
            //send mail to admin
            sendEmail({
                to: user.email,
                sub: sub,
                text: "",
                viewFileName: viewFileName,
                attachment: "",
                data: user
            });
        } else if (user.phone_number) {

        }
    },
}