const router = require('express').Router();


/*-----------------------------------
	INDEXES
-----------------------------------*/
const classInfo = require('./class/class_index')

/*-----------------------------------
	API
-----------------------------------*/
router.use('/class', classInfo);


module.exports = router;