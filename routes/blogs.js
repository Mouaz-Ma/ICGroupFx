const express = require('express');
const router = express.Router();
const blogs = require('../controllers/blogs');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(blogs.index))

router.route('/new')
.post(upload.array('image'),  catchAsync(blogs.createBlog))



// router.route('/:id')
//     .get(catchAsync(blogs.showBlog))
//     .put(isLoggedIn, isAuthor, upload.array('image'), catchAsync(blogs.updateBlog))
//     .delete(isLoggedIn, isAuthor, catchAsync(blogs.deleteBlog));

// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(blogs.renderEditForm))



module.exports = router;