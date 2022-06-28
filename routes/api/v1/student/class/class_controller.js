const { ObjectId } = require('bson');
var fs = require("fs");
const s3 = global.AWS_S3.s3;
const bucket = global.AWS_S3.bucket;

// 수업 가져오기
exports.getClass = async (req, res) => {
    console.log(`
--------------------------------------------------
  User Profile: req.decoded._id
  router.get('/getClass', classCtrl.getClass);
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

// 수업정보 가져오기
exports.getClassInfo = async (req, res) => {
    console.log(`
--------------------------------------------------
  User Profile: 
  router.get('/getClassInfo', classCtrl.getClassInfo);
--------------------------------------------------`);

    const dbModels = global.DB_MODELS;

    const data = req.query;


    const criteria = {
        '_id': data._id
    };


    try {
        const meetingInfo = await dbModels.Meeting.findOne(criteria);

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



/**
 *   참가한 회의 정보 불러오기
 */
exports.documentInfo = async (req, res) => {

    console.log(`
--------------------------------------------------
  User : 
  API  : Get my documentInfo
  router.get('/documentInfo', classCtrl.documentInfo);
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
 *   pdf 정보 불러오기
 */
exports.getPdfFile = async (req, res) => {

    console.log(`
--------------------------------------------------
  User : 
  API  : Get my getPdfFile
  router.get('/classInfo', classCtrl.getPdfFile);
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