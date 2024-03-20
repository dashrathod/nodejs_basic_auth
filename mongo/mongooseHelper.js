const mongoose = require('mongoose');

module.exports = async () => {

	try {
		mongoose.connect(process.env.databaseURL || 'mongodb://127.0.0.1:27017/nodejs_basic_auth', {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});


		// enable logging collection methods + arguments to the console
		mongoose.set('debug', Boolean(JSON.parse(process.env.databaseLog)) || false);

		// use custom function to log collection methods + arguments
		/* mongoose.set('debug', function(collectionName, methodName,...arguments) {
			console.log('\n\n',collectionName,methodName,...arguments,'\n\n')
		});  */

		var conn = mongoose.connection;
		conn.once('error', function (err) {
			console.error("⚠️  connection error  ⚠️");
			throw new Error("⚠️  connection error  ⚠️ " + err);
		});
		conn.once('connected', function () {
			console.info("✌️ mongo  connected  ✌️");
		});
		conn.once('disconnected', function () {
			console.info("✌️ mongo  disconnected  ✌️");
		});
		conn.once('open', function () {
			const fs = require('fs');
			fs.readdirSync('./mongo/models').forEach(file => {
				let filePath = `./mongo/models/${file}`;
				var stat = fs.statSync(filePath);
				if (stat.isFile()) {
					// console.info(`✌️ ${file} model loaded.. ✌️`);
					console.info('\x1b[33m%s\x1b[0m',`✌️ ${file} model loaded.. ✌️`);
					require(`./models/${file}`);
				}
			});
		});
		global.conn = conn;
		global.mongoObjectId = mongoose.Types.ObjectId;
		return conn;
	} catch (error) {
		throw new Error(error);
	}
};



