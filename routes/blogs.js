const express = require('express');
const router = express.Router();
const blogs = require('../controllers/blogs');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdministrator } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(blogs.index))

router.route('/new')
.post(upload.array('photo'),  catchAsync(blogs.createBlog))



router.route('/:id')
    .get(catchAsync(blogs.showBlog))
    .put(upload.array('photo'), catchAsync(blogs.updateBlog))
    .delete(blogs.deleteBlog);

// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(blogs.renderEditForm))



module.exports = router;