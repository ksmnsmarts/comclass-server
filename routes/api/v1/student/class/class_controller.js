const { ObjectId } = require('bson');
var fs = require("fs");

// 수업 가져오기
exports.getClass = async (req, res) => {
	console.log(`
--------------------------------------------------
  User Profile: req.decoded._id
  router.get('/getClass', adClassCtrl.getClass);
--------------------------------------------------`);

    const dbModels = global.DB_MODELS;

    const data = req.body;


	// const criteria = {
    //     'manager.manager_id': req.decoded._id 
    // };
	

	try {
		const meetingInfo = await dbModels.Meeting.find();

        if (!meetingInfo) {
			return res.status(401).send({
				message: 'An error has occurred'
			});
		}

		return res.send(
            meetingInfo
        );
        
	} catch (err) {
		console.log(err);
		return res.status(500).send('db Error');
	}

}