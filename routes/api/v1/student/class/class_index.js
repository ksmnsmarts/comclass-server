const router = require('express').Router();


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


module.exports = router;