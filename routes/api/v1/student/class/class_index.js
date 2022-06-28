const router = require('express').Router();
const multer = require("multer");

/*-----------------------------------
	INDEXES
-----------------------------------*/


/*-----------------------------------
	Controller
-----------------------------------*/
const classCtrl = require('./class_controller')



/*-----------------------------------
	API
-----------------------------------*/

/* Profile Image Update */
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/profile_img/temp');
    },
    filename(req, file, cb) {
        // fileName = encodeURI(file.originalname);
        cb(null, `${Date.now()}_${file.originalname}`);

        // cb(null, `${file.originalname}`);
    }
});
const upload = multer({ storage });




/*-----------------------------------
    Class 
-----------------------------------*/

router.get('/getClass', classCtrl.getClass);
router.get('/getClassInfo', classCtrl.getClassInfo);
router.get('/documentInfo', classCtrl.documentInfo);
router.get('/getPdfFile', classCtrl.getPdfFile);
module.exports = router;