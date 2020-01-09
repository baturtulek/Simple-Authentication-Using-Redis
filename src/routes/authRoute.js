const express             = require('express');
const authHelpers         = require('../helpers/auth_helpers');
const authManager         = require('../managers/authManager');
const loginValidator      = require('../validation/loginValidator');
const registerValidator   = require('../validation/registerValidator');
const { validate }        = require('../validation/validate');
const router              = express.Router();

router.post('/login', 
    loginValidator.validationRules(),
    validate, 
    authManager.login 
);

router.post('/register', 
    registerValidator.validationRules(),
    validate, 
    authManager.register 
);

router.post('/logout',
    authHelpers.isReqestContainsAuthHeader,
    authHelpers.isUserAuthenticated,
    authManager.logout
);

router.get('/profile', 
    authHelpers.isReqestContainsAuthHeader,
    authHelpers.isUserAuthenticated,
    authManager.getUserProfile
);

module.exports = router;
