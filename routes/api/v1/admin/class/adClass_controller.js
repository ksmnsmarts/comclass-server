const { ObjectId } = require('bson');
const mongoose = require('mongoose');
var fs = require("fs");
const s3 = global.AWS_S3.s3;
const bucket = global.AWS_S3.bucket;

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

// 수업정보 가져오기
exports.getClassInfo = async (req, res) => {
    console.log(`
--------------------------------------------------
  User Profile: ${req.decoded._id}
  router.get('/getClassInfo', adClassCtrl.getClassInfo);
--------------------------------------------------`);

    const dbModels = global.DB_MODELS;

    const data = req.query;


    const criteria = {
        '_id': data._id
    };


    try {
        const meetingInfo = await dbModels.Meeting.findOne(criteria);

		// 유효성 검사
		if (meetingInfo) {
			// Whiteboard document 생성
			const docObj = {
				_id: new mongoose.Types.ObjectId(),
				classId: meetingInfo._id,
				originalFileName: 'whiteboard',
				fileName: 'whiteboard',
				saveKey: 'upload-file/hcanvas.pdf',
				fileSize: 1840,
			}

			dbModels.Doc.init();
			let DocInfo = await dbModels.Doc.findOne({ classId: meetingInfo._id });
			// Doc이 없는 경우
			if (!DocInfo) {
				const docData = new dbModels.Doc(docObj);
				await docData.save();
			}

		} else {
			res.status(500).send('internal server error');
		}

        return res.send(
            meetingInfo
        );

    } catch (err) {
        console.log(err);
        return res.status(500).send('db Error');
    }

}



exports.upload = async (req, res) => {

    console.log(`
--------------------------------------------------
  User Profile: ${req.decoded._id}
  API  : Post my pdf
  router.post(/upload/:classId', meetingContollder.upload);
--------------------------------------------------`);
    const dbModels = global.DB_MODELS;

    try {

        if (!req.params.classId) {
            return res.status(400).send('invalid meeting id1');
        }

        result = await dbModels.Meeting.findOne({ _id: req.params.classId });

        if (!result) {
            return res.status(400).send('invalid meeting id2');
        }
        // console.log(req.files[0])
        const criteria = {
            classId: req.params.classId,
            originalFileName: req.files[0].originalname,
            fileName: req.files[0].filename,
            saveKey: req.files[0].key,
            fileSize: req.files[0].size,
        }

        const docData = new dbModels.Doc(criteria);
        await docData.save()
        res.send({
            message: 'document uploaded'
        });

    } catch (err) {
        console.log(err);
        res.status(500).send('internal server error');
    }

}


/**
 *   참가한 회의 정보 불러오기
 */
exports.documentInfo = async (req, res) => {

    console.log(`
--------------------------------------------------
  User : 
  API  : Get my documentInfo
  router.get('/documentInfo', adClassCtrl.documentInfo);
--------------------------------------------------`);
    const dbModels = global.DB_MODELS;

    const data = req.query;
    const criteria = {
        classId: data.classId
    }


    try {
        const meetingResult = await dbModels.Meeting.findOne(criteria);
        const docResult = await dbModels.Doc.find(criteria).select({
            saveKey: 0,
            classId: 0
        });

        res.send({
            meetingResult: meetingResult,
            docResult: docResult
        })

    } catch (error) {
        console.log(error);
    }
}

/**
 *   참가한 회의 정보 불러오기
 */
exports.getPdfFile = async (req, res) => {

    console.log(`
--------------------------------------------------
  User : 
  API  : Get my getPdfFile
  router.get('/classInfo', adClassCtrl.getPdfFile);
--------------------------------------------------`);
    const dbModels = global.DB_MODELS;

    const data = req.query

    const criteria = {
        _id: data._id
    }

    await dbModels.Doc.findOne(criteria).then((result) => {
        const key = result.saveKey;
        res.attachment(key);
        var file = s3.getObject({
            Bucket: bucket,
            Key: key
        }).createReadStream()
            .on("error", error => {
                console.log(error)
            });
        file.pipe(res);
    })

    // dbModels.Doc.findOne(criteria).then((result) => {
    //     const filePath = `./` + result.savePath;
    //     console.log(filePath);
    //     res.download(filePath);
    // })


}

/**
 *   참가중 인 수업 PDF 삭제
 */
exports.deleteClassPdfFile = async (req, res) => {

	console.log(`
--------------------------------------------------
  User : 
  API  : Delete ClassPdfFile
  router.get('/deleteClassPdfFile', adClassCtrl.deleteClassPdfFile);
--------------------------------------------------`);
	const dbModels = global.DB_MODELS;

	try {

		if (!req.query._id) {
			return res.status(400).send('invalid meeting id1');
		}
		

		result = await dbModels.Doc.findOne({ _id: req.query._id }, { _id: false, saveKey: true, classId: true });

		if (!result) {
			return res.status(400).send('invalid meeting id2');
		}
		// console.log(req.files[0])
		const params = {
			Bucket: bucket,
			Key: result.saveKey
		};
		s3.deleteObject(params, function (err, data) {
			if (err) console.log(err, err.stack);
			else console.log('s3 delete Success');
		})
		await dbModels.Doc.findOneAndDelete(
			{
				_id: req.query._id
			}
		)

		res.status(200).send({
			message: 'upload file delete',
			classId: result.classId,
		});


	} catch (err) {
		console.log(err);
		res.status(500).send('internal server error');
	}

}