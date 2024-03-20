module.exports = async () => {
	try {
		let admin = await adminModel.find({});
		if (!admin.length) {
			console.log(`generating new admin....`);
			await adminModel.create({
				email: "admin@admin.com",
				password: "123456",
				name: "admin",
			});
		}
	} catch (error) {
		throw new Error(error);
	}
};



