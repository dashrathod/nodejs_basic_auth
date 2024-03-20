const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
var bcrypt = require('bcrypt'),
	SALT_WORK_FACTOR = 10;

const schema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: false,
			trim: true,
			match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, `Please fill valid email address`],
			validate: {
				validator: function () {
					if (this.email) {
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
					} else {
						return true;
					}
				}, message: 'Email Already Taken'
			}
		},
		phone_number: {
			type: String,
			required: false,
			trim: true,
			validate: {
				validator: function () {
					if (this.phone_number) {
						return new Promise((res, rej) => {
							model.findOne({ phone_number: this.phone_number, _id: { $ne: this._id } })
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
					} else {
						return true;
					}
				}, message: 'Phone Number Already Taken'
			},
		},
		role: { type: Number, required: true, trim: true, default: 1, enum: [1, 2], }, // 1-> renter,2->host
		first_name: { type: String, required: true, trim: true },
		last_name: { type: String, required: true, trim: true },
		dob: { type: String, required: true, trim: true },
		address: { type: String, required: true, trim: true },
		city: { type: String, required: true, trim: true },
		state: { type: String, required: true, trim: true },
		country: { type: String, required: true, trim: true },
		// drivering_licence_number: { type: String, required: true, trim: true },
		password: { type: String, required: true, trim: true },
		// social_security_number: { type: String, required: false, trim: true },
		is_verified: { type: Boolean, required: true, trim: true, default: false },
		is_document_verified: { type: Boolean, required: true, trim: true, default: false },
		is_signed_agreements: { type: Boolean, required: true, trim: true, default: false },
		verification: {
			otp: { type: String, trim: true, default: '' },
			// expire: { type: Date, default: new Date(+new Date() + 1*24*60*60*1000)  },
			expire: { type: Date, default: () => new Date(+new Date() + 1 * 60 * 1000) },
		},
		account_status: { type: String, required: true, trim: true, default: "disabled", enum: ['enabled', 'disabled', 'not_active'] },
		login_at: { type: Date },
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

schema.virtual('full_name').get(() => {
	return this.first_name + ' ' + this.last_name;
});



let model = mongoose.model('User', schema);
global.userModel = model;
module.exports = model;