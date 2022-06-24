const router = require('express').Router();

/*-----------------------------------
	INDEXES
-----------------------------------*/


/*-----------------------------------
	Controller
-----------------------------------*/
const adClassCtrl = require('./adClass_controller')



/*-----------------------------------
	API
-----------------------------------*/




// multer 설정 -----------------------------------------------
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = global.AWS_S3.s3;
const bucket = global.AWS_S3.bucket;

// Multer File upload settings
const DIR = './public/uploads/';

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, DIR);
    },
    filename: (req, file, callback) => {
        let datetimestamp = Date.now();
        let originalFileName = file.originalname;
        originalFileName = originalFileName.split('.');
        let originalName = originalFileName[originalFileName.length - 1];
        callback(null, file.fieldname + '_' + datetimestamp + '.' + originalName);
    }
});

// Multer Mime Type Validation
const upload = multer({
    // storage: storage,
    // limits: {
    //     fileSize: 1024 * 1024 * 16
    // },
    // fileFilter: (req, file, cb) => {
    //     if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
    //         cb(null, true);
    //     } else {
    //         cb(null, false);
    //         return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    //     }
    // }

    storage: multerS3({
		s3, // == s3: s3
		bucket,
		acl: 'public-read',
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key: (req, file, cb) => {
			if (req.files && req.files.length > 0) {
				cb(null, `upload-file/${Date.now()}.${file.originalname}`);
			} else {
				// 사진은 없고 텍스트만 있을 때는 어떻게 넘어가야하는지?? todo!!
			}
		}
    })
});




/*-----------------------------------
    Class 
-----------------------------------*/
router.post('/addClass', adClassCtrl.addClass);
router.get('/getClassInfo', adClassCtrl.getClassInfo);
router.get('/getClass', adClassCtrl.getClass);
router.post('/upload/:classId', upload.any(), adClassCtrl.upload);
router.get('/documentInfo', adClassCtrl.documentInfo);
router.get('/getPdfFile', adClassCtrl.getPdfFile);

module.exports = router;