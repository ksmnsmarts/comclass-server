const router = require('express').Router();

const { isAuthenticated } = require('../../../middlewares/auth');

// AUTH
const auth = require('./auth/auth_index');
const adAuth = require('./admin/adAuth/adAuth_index');

// AUTH
const user = require('./user/user_index');

const admin = require('./admin/admin_index');


/*-----------------------------------
	not needed to verify
-----------------------------------*/
router.use('/auth', auth);
router.use('/adAuth', adAuth);

/*-----------------------------------
	Token verify
-----------------------------------*/
router.use(isAuthenticated);

/*-----------------------------------
	API
-----------------------------------*/
router.use('/admin', admin);
router.use('/user', user);


/*-----------------------------------
	Nsmarts
-----------------------------------*/


module.exports = router;