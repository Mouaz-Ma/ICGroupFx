const express = require('express');
const router = express.Router();
const analysiss = require('../controllers/analysiss');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateAnalysis } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Analysis = require('../models/analysis');

router.route('/')
    .get(catchAsync(analysiss.index))
    .post(isLoggedIn, upload.array('image'), validateAnalysis, catchAsync(analysiss.createAnalysis))


router.get('/new', isLoggedIn, analysiss.renderNewForm)

router.route('/:id')
    .get(catchAsync(analysiss.showAnalysis))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateAnalysis, catchAsync(analysiss.updateAnalysis))
    .delete(isLoggedIn, isAuthor, catchAsync(analysiss.deleteAnalysis));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(analysiss.renderEditForm))



module.exports = router;