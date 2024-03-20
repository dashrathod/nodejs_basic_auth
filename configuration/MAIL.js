const nodemailer = require("nodemailer");
try {
    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    });
    var mails = {
    };
    mails.send = async function (to, subject, html, text = "", from = '') {
        if (!from) {
            from = `nodejs_basic_auth ${commonSiteSettings['mailFrom'] || process.env.MAIL_FROM || 'mail@nodejs_basic_auth.net'}`;
        }

        var info = await transporter.sendMail({
            from: from, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html // html body
        }).catch(function (err) {
            throw err;
        });

        return info;

        // send mail with defined transport object
        /* var mailOptions = {
             from: from, // sender address
             to: to, // list of receivers
             subject: subject, // Subject line
             text: text, // plain text body
             html: html // html body
         };
 
         transporter.sendMail(mailOptions, await function (error, info) {
             if (error) {
                 throw err;
             } else {
                 return 22222222222;
             }
         }); */

    };
} catch (error) {
    throw error;
    // res.send(JSON.stringify(error,null,2));
}



module.exports = mails;
global.mail = mails;
