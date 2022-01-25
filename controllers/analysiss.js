const Analysis = require('../models/anallysis');
const { cloudinary } = require("../cloudinary");


// get all anallysiss in the index
module.exports.index = async (req, res) => {
    const anallysiss = await Analysis.find({}).populate('popupText');
    res.render('anallysiss/index', { anallysiss })
}

// new anallysis form render
module.exports.renderNewForm = (req, res) => {
    res.render('anallysiss/new');
}

// creating a new anallysis
module.exports.createAnalysis = async (req, res, next) => {
    const anallysis = new Analysis(req.body.Analysis);
    anallysis.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    anallysis.author = req.user._id;
    await anallysis.save();
    req.flash('success', 'Successfully made a new anallysis!');
    res.redirect(`/anallysiss/${anallysis._id}`)
}

// showing one anallysis
module.exports.showAnalysis = async (req, res,) => {
    const anallysis = await Analysis.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!anallysis) {
        req.flash('error', 'Cannot find that anallysis!');
        return res.redirect('/anallysiss');
    }
    res.render('anallysiss/show', { anallysis });
}

// rendering Edit form
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const anallysis = await Analysis.findById(id)
    if (!anallysis) {
        req.flash('error', 'Cannot find that anallysis!');
        return res.redirect('/anallysis');
    }
    res.render('anallysis/edit', { anallysis });
}

// updating anallysis
module.exports.updateAnalysis = async (req, res) => {
    const { id } = req.params;
    const anallysis = await Analysis.findByIdAndUpdate(id, { ...req.body.anallysis });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    anallysis.images.push(...imgs);
    await anallysis.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await anallysis.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated anallysis!');
    res.redirect(`/anallysiss/${anallysis._id}`)
}

// deleting a anallysis
module.exports.deleteAnalysis = async (req, res) => {
    const { id } = req.params;
    await Analysis.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted analysis');
    res.redirect('/analysiss');
}