const express = require('express');
const router = express.Router();
const analysis = require('../controllers/analysis');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateAnalysis } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
// const upload = multer({ storage });

const Analysis = require('../models/analysis');

// get categories
router.route('/analysisCategory')
    .get(analysis.getAllCategories)
    .post(analysis.createNewCategory)

// here we are sending analysis category id so with get we are getting all analysis with that category
// with post we are making an analysis with specific category Id
router.route('/:id')
    .get(catchAsync(analysis.index))


function uploadFile(req, res, next) {
    const upload = multer({ storage }).fields([{name: 'photo', maxCount: 1}, {name: 'audio', maxCount: 1}])

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log("first error" + err)
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log("second error" + err)
        }
        // Everything went fine. 
        next()
    })
}

router.route('/new').post(uploadFile, analysis.createAnalysis)

// router.route('/single/:id')
//     .get(catchAsync(analysis.getSingle))
//     .put(upload.array('photo'),catchAsync(analysis.updateSingle))
//     .delete(catchAsync(analysis.deleteSingle))


// router.get('/new', isLoggedIn, analysis.renderNewForm)

// router.route('/:id')
//     .get(catchAsync(analysis.showAnalysis))
//     .put(isLoggedIn, isAuthor, upload.array('image'), validateAnalysis, catchAsync(analysis.updateAnalysis))
//     .delete(isLoggedIn, isAuthor, catchAsync(analysis.deleteAnalysis));

// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(analysis.renderEditForm))



module.exports = router;