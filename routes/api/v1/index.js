const router = require('express').Router();
// 현재 student는 로그인을 하지 않아 주석처리
// const { isAuthenticated } = require("../../../middlewares/auth");

// AUTH
const auth = require('./auth/auth_index');
const adAuth = require('./admin/adAuth/adAuth_index');

// AUTH
const user = require('./user/user_index');
const admin = require('./admin/admin_index');
const student = require("./student/student_index");


/*-----------------------------------
	not needed to verify
-----------------------------------*/
router.use('/auth', auth);
router.use('/adAuth', adAuth);

// 현재 student는 로그인을 하지 않아 주석처리
// /*-----------------------------------
// 	Token verify
// -----------------------------------*/
// router.use(isAuthenticated);

/*-----------------------------------
	API
-----------------------------------*/
router.use('/admin', admin);
router.use('/user', user);
router.use("/student", student);

/*-----------------------------------
	Nsmarts
-----------------------------------*/


module.exports = router;