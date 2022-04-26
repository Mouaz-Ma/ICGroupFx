const express = require('express');
const router = express.Router();
const analysis = require('../controllers/analysis');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateAnalysis } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Analysis = require('../models/analysis');

// get categories
router.route('/analysisCategory')
    .get(analysis.getAllCategories)
    .post(analysis.createNewCategory)

// here we are sending analysis category id so with get we are getting all analysis with that category
// with post we are making an analysis with specific category Id
router.route('/:id')
    .get(catchAsync(analysis.index))


async function uploadFile(req, res, next) {
    const upload = await multer({ storage }).fields([{name: 'photo', maxCount: 1}, {name: 'audio', maxCount: 1}])

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log("first error" + JSON.stringify(err))
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log("second error" + JSON.stringify(err))
        }
        // Everything went fine. 
        next()
    })
}

router.route('/new').post(uploadFile, analysis.createAnalysis)

router.route('/single/:id')
    .get(catchAsync(analysis.getSingle))
    .put(uploadFile, analysis.updateSingle)
    .delete(catchAsync(analysis.deleteSingle))



module.exports = router;