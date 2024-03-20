const dotenv = require('dotenv');

const envFound = dotenv.config();
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (!envFound || envFound.error) {
	throw new Error("⚠️  Couldn't find .env file  ⚠️");
}
else if (Object.keys(envFound.parsed).length === 0 && envFound.parsed.constructor === Object) {
	throw new Error("⚠️  No environment configurations found in .env file  ⚠️");
}
module.exports = dotenv;