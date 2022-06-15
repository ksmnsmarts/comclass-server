const { ObjectId } = require('bson');
var fs = require("fs");


// 수업 등록
exports.addClass = async (req, res) => {
	console.log(`
--------------------------------------------------
  User Profile: ${req.decoded._id}
  router.post('/addClass', adClassCtrl.addClass)
--------------------------------------------------`);

    const dbModels = global.DB_MODELS;

    const data = req.body;


	const criteria = { _id: req.decoded._id };
	const projection = {
		password: false,
        profile_img_key: false,
        profile_img: false,
        mobile: false,
		createdAt: false,
		updatedAt: false
	}

	try {
		const adUser = await dbModels.Admin.findOne(criteria, projection);

        if (!adUser) {
			return res.status(401).send({
				message: 'An error has occurred'
			});
		}


        const meetingData = {
            teacher: data.teacher,
            subject: data.subject,
            'manager.manager_id': adUser._id,
            'manager.manager_email': adUser.email,
            'manager.manager_name': adUser.name,
            status: 'Pending'   
        }

        const meeting = dbModels.Meeting(meetingData)
        await meeting.save()
		

		return res.send({
            message: 'Success saved class',
        });
	} catch (err) {
		console.log(err);
		return res.status(500).send('db Error');
	}
};


// 수업 가져오기
exports.getClass = async (req, res) => {
	console.log(`
--------------------------------------------------
  User Profile: ${req.decoded._id}
  router.get('/getClass', adClassCtrl.getClass);
--------------------------------------------------`);

    const dbModels = global.DB_MODELS;

    const data = req.body;


	const criteria = {
        'manager.manager_id': req.decoded._id 
    };
	

	try {
		const meetingInfo = await dbModels.Meeting.find(criteria);

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