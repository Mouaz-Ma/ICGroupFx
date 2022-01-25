const Blog = require('../models/blog');
const { cloudinary } = require("../cloudinary");


// get all blogs in the index
module.exports.index = async (req, res) => {
    const blogs = await Blog.find({}).populate('popupText');
    res.render('blogs/index', { blogs })
}

// new blog form render
module.exports.renderNewForm = (req, res) => {
    res.render('blogs/new');
}

// creating a new blog
module.exports.createBlog = async (req, res, next) => {
    const blog = new Blog(req.body.Blog);
    blog.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    blog.author = req.user._id;
    await blog.save();
    req.flash('success', 'Successfully made a new blog!');
    res.redirect(`/blogs/${blog._id}`)
}

// showing one blog
module.exports.showBlog = async (req, res,) => {
    const blog = await Blog.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!blog) {
        req.flash('error', 'Cannot find that blog!');
        return res.redirect('/blogs');
    }
    res.render('blogs/show', { blog });
}

// rendering Edit form
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findById(id)
    if (!blog) {
        req.flash('error', 'Cannot find that blog!');
        return res.redirect('/blog');
    }
    res.render('blog/edit', { blog });
}

// updating Blog
module.exports.updateBlog = async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findByIdAndUpdate(id, { ...req.body.blog });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    blog.images.push(...imgs);
    await blog.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await blog.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated blog!');
    res.redirect(`/blogs/${blog._id}`)
}

// deleting a blog
module.exports.deleteBlog = async (req, res) => {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted blog');
    res.redirect('/blogs');
}