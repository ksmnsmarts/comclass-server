const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const mongApp = {}; 
mongApp.appSetObjectId = function (app) {
	app.set('ObjectId', mongoose.Types.ObjectId);
	console.log('complete to set mongoose ObjectId');
}

main().catch(err => console.log(err));

async function main() {

	// test-potatocs , potatocs 
	await mongoose.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}).then( ()=> {
		createSchema();
		console.log('Database Connected');
	});
}

function createSchema() {
	const dbModels = {};

	dbModels.Admin = require('../models/admin_schema');
    dbModels.Meeting = require('../models/meeting_schema');
    dbModels.Doc = require('../models/doc_schema');
	

	global.DB_MODELS = dbModels;
}

module.exports = mongApp;
