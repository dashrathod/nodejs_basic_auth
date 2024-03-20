const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const schema = new mongoose.Schema(
	{
		user_id: { type: mongoose.Schema.Types.ObjectId, required: true, trim: true, ref: 'User' },
		path: { type: String, required: false, trim: true },
		unique_no: { type: String, required: false, trim: true },
		doc_type: { type: String, required: true, trim: true, default: 'driving_licence', enum: ['driving_licence', 'national_id'], },
		is_verified: { type: Boolean, required: true, trim: true, default: false },
		verified_by: { type: mongoose.Schema.Types.ObjectId, required: false, trim: true, ref: 'Admin' },
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

let model = mongoose.model('UsersDocument', schema);
global.usersDocumentsModel = model;
module.exports = model;