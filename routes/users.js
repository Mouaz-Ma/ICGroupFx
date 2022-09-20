const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const users = require('../controllers/users');
const { isLoggedIn, isAuthor, validateAnalysis, verifyToken } = require('../middleware');



router.route('/register')
    .post(catchAsync(users.register));

router.route('/registerSocial')
    .post(catchAsync(users.registerSocial));

router.route('/login')
    .post(users.login)
// profile
router.route('/user')
    .get(verifyToken ,users.user)

// EmailVerifying
router.route('/verify/:uniqueString')
    .get(users.emailVerify)
// get verified
router.route('/varifyById/:id')
    .get(users.getVerified)

// password reset
router.route('/requestReset').post(users.requestReset)

router.route('/passReset/:token')
    .get(users.passResetGet)
    .post(users.passResetPost)

router.route('/updateUser')
.put(verifyToken ,users.updateUser)

// profile pic
router.route('/uploadAvatar')
.put(upload.array('avatar'), verifyToken ,users.uploadAvatar)

router.route('/updateUser/:id')
.put(verifyToken, users.updateUserInfo)

router.post('/logout', users.logout)

// search Users
router.route('/search').get(users.searchUser)

// contact form
router.post('/contact', users.contact)

module.exports = router;
