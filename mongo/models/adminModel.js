const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
var bcrypt = require('bcrypt'),
	SALT_WORK_FACTOR = 10;

const schema = new mongoose.Schema(
	{
		first_name: { type: String, trim: true },
		last_name: { type: String, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, `Please fill valid email address`],
			validate: {
				validator: function () {
					return new Promise((res, rej) => {
						model.findOne({ email: this.email, _id: { $ne: this._id } })
							.then(data => {
								if (data) {
									res(false)
								} else {
									res(true)
								}
							})
							.catch(err => {
								res(false)
							})
					})
				}, message: 'Email Already Taken'
			}
		},
		password: { type: String, trim: true },
		/* verification: {
			otp: { type: String, trim: true, default: '' },
			// expire: { type: Date, default: new Date(+new Date() + 1*24*60*60*1000)  },
			expire: { type: Date, default: () => new Date(+new Date() + 1 * 60 * 1000) },
		}, */
		created_at: { type: Date, default: Date.now },
		updated_at: { type: Date, default: Date.now }
	},
	{
		strict: true,
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at'
		}
	},
);

schema.plugin(aggregatePaginate);

schema.pre('save', async function (next) {
	var user = this;
	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();
	try {
		// generate a salt
		// hash the password using our new salt
		const salt = await bcrypt.genSaltSync();
		user.password = await bcrypt.hashSync(user.password, salt);
		return next();
	} catch (error) {
		return next(error);
	}
});

schema.pre(["updateOne", "findByIdAndUpdate", "findOneAndUpdate"], async function (next) {
	let data = this.getUpdate();
	if (!data.password) {
		return next();
	}

	try {
		// generate a salt
		// hash the password using our new salt
		const salt = await bcrypt.genSaltSync();
		data.password = await bcrypt.hashSync(data.password, salt);
		return next();
	} catch (error) {
		return next(error);
	}
});

schema.methods.validatePassword = async function validatePassword(data) {
	return bcrypt.compare(data, this.password);
};



let model = mongoose.model('Admin', schema);
global.adminModel = model;
require('../generateAdmin.js')();
module.exports = model;