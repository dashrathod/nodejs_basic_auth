const { check, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const fs = require("fs");
const pathNode = require('path');

exports.validatedData = async function (req, res, next) {
	let result = validationResult(req);
	if (!result.isEmpty()) {
		let missing_param = result.array();
		let param = `${result.array().shift().param} : `;
		let msg = `${result.array().shift().msg}`;
		// res.locals.errorMsg = `Something Went Wrong`;
		// return res.redirect('back');
		return responseHelper.failed(res, { resp_code: 500, missing_param: missing_param });
	}
	next();
};

exports.validatedDataEjs = async function (req, res, next) {
	let result = validationResult(req);
	if (!result.isEmpty()) {
		let missing_param = result.array();
		let param = `${result.array().shift().param} : `;
		let msg = `${result.array().shift().msg}`;
		res.locals.errorMsg = msg;
		let backURL = req.header('Referer') || '/';
		return res.redirect('back');
		// return responseHelper.failed(res, { resp_code: 500, missing_param: missing_param });
	}
	next();
};

exports.getCallerIP = async function (request) {
	try {
		var ip = request.headers['x-forwarded-for'] ||
			request.connection.remoteAddress ||
			request.socket.remoteAddress ||
			request.connection.socket.remoteAddress;
		ip = ip.split(',').shift();
		ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
		if (typeof ip == 'object' && ip.length > 0) {
			return ip.shift();
		} else {
			return ip;
		}
	} catch (error) {
		throw error;
	}
};

exports.encryptPassword = function (password) {
	const crypto = require('crypto');
	try {
		return crypto.createHash('md5').update(password).digest('hex');
	}
	catch (error) {
		// console.error(error);
	}
};


exports.generateServerToken = function (length = 32) {
	let token = "";
	let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < length; i++) {
		token += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return token;
};

exports.generatePassword = function (length = 10) {
	let token = "";
	let possible = "01234567890";
	for (let i = 0; i < length; i++) {
		token += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return token;
};

exports.arrayRemove = async function (arr, value) {
	return arr.filter(function (ele) { return ele != value; });
}

exports.verifyMailService = async function () {
	try {
		let transporter = nodemailer.createTransport({
			host: process.env.MAIL_HOST || "",
			port: process.env.MAIL_PORT || 465,
			secure: false,
			auth: {
				user: process.env.MAIL_USERNAME || "",
				pass: process.env.MAIL_PASSWORD || ""
			}
		});
		// verify connection configuration
		transporter.verify(function (error, success) {
			if (error) {
				console.log(error);
			} else {
				console.log("Server is ready to take our messages via mail");
			}
		});
	} catch (error) {
		throw error;
	}
}


exports.mail_notification = async function ({ to, sub, text, html, attachment }) {
	try {
		let transporter = nodemailer.createTransport({
			host: process.env.MAIL_HOST || "",
			port: process.env.MAIL_PORT || 465,
			secure: false,
			auth: {
				user: process.env.MAIL_USERNAME || "",
				pass: process.env.MAIL_PASSWORD || ""
			}
		});

		let mailOptions = {
			from: process.env.MAIL_FROM || "",
			to: to,
			subject: sub,
			text: text,
			html: html
		};
		if (attachment) {
			/* mailOptions.attachments = [
				{
					// binary buffer as an attachment
					filename: `${Date.now()}_failed__employees.xlsx`,
					content: attachment,
					// content: Buffer.from(attachment, 'utf-8')
				}
			]; */
			mailOptions.attachments = attachment;
		}

		await transporter.sendMail(mailOptions);
	}
	catch (error) {
		// console.error(error);
		throw error;
	}
};

exports.sendEmail = async function ({ to, sub, text, html, attachment, viewFileName, data }) {
	const fs = require("fs");
	const ejs = require("ejs");
	try {
		if (to) {
			if (!html && viewFileName) {
				let template = `${process.cwd()}/views/emails/${viewFileName}`;
				let file = fs.readFileSync(template, 'utf8');
				let compiledTmpl = ejs.compile(file, { filename: template });
				html = compiledTmpl(data);
				html = html.replace(/&lt;/g, "<");
				html = html.replace(/&gt;/g, ">");
				html = html.replace(/&#34;/g, '"');
			}
			await exports.mail_notification({ to, sub, text, html, attachment });
			return true;
		}
		return false;
	}
	catch (error) {
		// console.log('>>>>>>>>>>>>>>> ', error);
		// throw error;
	}
};

exports.uploadImage = async function ({ destPath, sourcePath, type }) {
	try {
		if (type && type.startsWith("image")) {
			return new Promise(function (resolve, reject) {
				fs.readFile(sourcePath, function (error, datad) {
					fs.writeFile(destPath, datad, 'binary', function (error) {
						if (error) {
							reject(error);
						}
						resolve(true);
					});
				});
			});
		} else {
			return false;
		}
	}
	catch (error) {
		// console.log('>>>>>>>>>>>>>>> ', error);
		throw error;
	}
};

function MoveFile(params, path) {
	return new Promise(function (resolve, reject) {
		params.mv(path, function (err) {
			if (err) {
				reject(err);
			} else {
				resolve(true);
			}
		});
	});
}

exports.uploadDocumentImage = async function ({ req, inputName, curId, saveDir }) {
	try {
		return new Promise(async function (resolve, reject) {
			let images = [];
			if (req.files && Object.keys(req.files).length > 0) {
				let uploadPath = `${process.cwd()}${saveDir}`;
				if (req.files[inputName].length) {
					for (let itm of req.files[inputName]) {
						sampleFile = itm;
						let timeName = new Date().getTime() + '_' + exports.generateServerToken(5);
						let unqName = `${timeName}${pathNode.extname(sampleFile.name)}`;
						sampleFile.name = unqName;
						let path = `${uploadPath}/${curId}/${sampleFile.name}`
						let dir = `${uploadPath}/${curId}`
						const fs = require('fs');
						!fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true });
						// fs.rmdirSync(dir, { recursive: true });
						// Use the mv() method to place the file somewhere on your server
						await MoveFile(sampleFile, path);
						images.push(sampleFile.name);
					}
					resolve(images);
				} else {
					var imgURLS = [];
					sampleFile = req.files[inputName];
					let timeName = new Date().getTime() + '_' + exports.generateServerToken(5);
					let unqName = `${timeName}${pathNode.extname(sampleFile.name)}`;
					sampleFile.name = unqName;
					let path = `${uploadPath}/${curId}/${sampleFile.name}`
					let dir = `${uploadPath}/${curId}`
					const fs = require('fs');
					!fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true });
					// fs.rmdirSync(dir, { recursive: true });
					// Use the mv() method to place the file somewhere on your server
					sampleFile.mv(path, async function (err) {
						if (err) {
							reject(err);
						}
						images.push(sampleFile.name);
						resolve(images);
					});
				}

			} else {
				resolve([]);
			}
		});

	}
	catch (error) {
		// console.log('>>>>>>>>>>>>>>> ', error);
		throw error;
	}
};

exports.getDifferentTime = async function (stratDate, endDate, startTime, endTime) {
	try {
		return new Promise(async function (resolve, reject) {
			resolve(date_diff(stratDate, endDate, 'day'))
			var moment = require('moment');
			let nowDate = moment(Date.now()).format("YYYY-MM-DD");
			let nowTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
			let dateOfStart = moment(stratDate).format("YYYY-MM-DD");
			let dateOfEnd = moment(endDate).format("YYYY-MM-DD");
			console.log(startTime, endTime);
			let timeOfStart = moment(Date.now()).format("YYYY-MM-DD") + " " + startTime;
			let timeOfEnd = moment(Date.now()).format("YYYY-MM-DD") + " " + endTime;
			let diffDate, diffTime;
			diffDate = (moment(dateOfStart).diff(nowDate) <= 0) && (moment(dateOfEnd).diff(nowDate) >= 0);
			if (moment(dateOfStart).diff(nowDate) === 0) {
				diffTime = (moment(timeOfStart).diff(nowTime) < 0);
				diffDate = diffTime;
			}
			if (moment(dateOfEnd).diff(nowDate) === 0) {
				diffTime = (moment(timeOfEnd).diff(nowTime) > 0);
				diffDate = diffTime;
			}
			resolve(diffDate);
		});

	}
	catch (error) {
		// console.log('>>>>>>>>>>>>>>> ', error);
		throw error;
	}
};

// https://stackoverflow.com/questions/45592573/how-to-calculate-difference-between-two-dates-using-node-js
exports.getDateDifferent = async function (d1, d2, get_item) {
	try {
		var date1 = new Date(d1)
		var date2 = new Date(d2)
		var Difference_In_Time = date1.getTime() - date2.getTime();
		switch (get_item) {
			case 'month':
				return Math.round(Difference_In_Time / (1000 * 3600 * 24 * 30));
			case 'day':
				return Math.round(Difference_In_Time / (1000 * 3600 * 24));
			case 'hour':
				return Math.round(Difference_In_Time / (1000 * 3600));
			case 'minute':
				return Math.round(Difference_In_Time / (1000 * 60));
			case 'second':
				return Math.round(Difference_In_Time / 1000);
			default:
				break;
		}

	}
	catch (error) {
		// console.log('>>>>>>>>>>>>>>> ', error);
		throw error;
	}
};
