const router = require('express').Router();
const multer = require('multer');
const { isAuthenticated } = require("../../../../middlewares/auth");

/*-----------------------------------
	Token verify
-----------------------------------*/
router.use(isAuthenticated);


/*-----------------------------------
	INDEXES
-----------------------------------*/
const classInfo = require('./class/adClass_index')

/*-----------------------------------
	Controller
-----------------------------------*/
const adProfileCtrl = require('./adProfile/adProfile_controller');



/*-----------------------------------
	API
-----------------------------------*/
router.use('/classInfo', classInfo);




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
/* Profile */
router.get('/profile', adProfileCtrl.profile);



module.exports = router;