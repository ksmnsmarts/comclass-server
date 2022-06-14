const router = require('express').Router();
const multer = require('multer');


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
router.post('/addClass', adClassCtrl.addClass);
router.get('/getClass', adClassCtrl.getClass);


module.exports = router;