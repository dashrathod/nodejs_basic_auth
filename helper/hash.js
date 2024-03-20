const bcrypt = require('bcrypt');
let saltRounds = process.env.saltRounds || '10';

exports.encryptData = async function ({ text }) {
	try {
		return bcrypt.hash(text.toString(), Number(saltRounds));
	} catch (error) {
		throw error;
	}
};

exports.compareData = async function ({ text, hash }) {
	try {
		return bcrypt.compare(text.toString(), hash);
	} catch (error) {
		throw error;
	}
};
