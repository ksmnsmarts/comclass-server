const { ObjectId } = require('bson');
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
  API  : Get my classInfo
  router.get('/classInfo', adClassCtrl.getPdfFile);
--------------------------------------------------`);
    const dbModels = global.DB_MODELS;

    const data = req.query
    console.log(data)

    const criteria = {
        _id: data._id
    }

    await dbModels.Doc.findOne(criteria).then((result) => {
        console.log(result)
        const key = result.saveKey;
        res.attachment(key);
        var file = s3.getObject({
            Bucket: bucket,
            Key: key
        }).createReadStream()
            .on("error", error => {
            });
        file.pipe(res);
    })

    // dbModels.Doc.findOne(criteria).then((result) => {
    //     const filePath = `./` + result.savePath;
    //     console.log(filePath);
    //     res.download(filePath);
    // })


}