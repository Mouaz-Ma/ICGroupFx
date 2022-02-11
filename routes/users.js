const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');
const { isLoggedIn, isAuthor, validateAnalysis, verifyToken } = require('../middleware');



router.route('/register')
    .post(catchAsync(users.register));

router.route('/login')
    .post(users.login)
// profile or verify
router.route('/verify')
    .get(verifyToken ,users.verify)

router.route('/updateUser')
.put(verifyToken ,users.updateUser)

router.get('/logout', users.logout)

module.exports = router;
