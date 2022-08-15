const express = require('express');
const router = express.Router();
const news = require('../controllers/news');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdministrator } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(news.index))

router.route('/new')
.post(upload.array('photo'),catchAsync(news.createNew))


// news tickertape 
router.route('/ticker')
    .get(news.tickerTape)

router.route('/:id')
    .get(catchAsync(news.showNew))
    .put(isAdministrator, upload.array('photo'),catchAsync(news.updateNew))
    .delete(isAdministrator, news.deleteNew);

// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(blogs.renderEditForm))



module.exports = router;