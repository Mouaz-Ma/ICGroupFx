const Analysis = require('../models/analysis');
const analysisCategory = require('../models/analysisCategory');
const { cloudinary } = require("../cloudinary");
const multer = require('multer');

// get all analysis Categories
module.exports.getAllCategories = async (req, res) => {
    try {
        const categories = await analysisCategory.find({});
        res.json({
            success: true,
            categories: categories,
            message: "Loaded all Categories"
          })
    } catch (err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
          })
    }
}

// Create a new analysis category
module.exports.createNewCategory = async (req, res) => {
    try {
        const category = new analysisCategory();
        category.type = req.body.type;
        await category.save();
        res.json({
            success: true,
            category: category,
            message: "New Category Saved"
          })
    } catch (err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
          })
    }
}

// get all analysis in the index with a specific category
module.exports.index = async (req, res) => {
    try{
        const analysis = await Analysis.find({'category' : req.params.id}).populate('category');
        res.json({
            success: true,
            analysis: analysis,
            message: "analysis retrieved succesfully!"
          })
    } catch (err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
          })
    }
}

// creating a new analysis
module.exports.createAnalysis = async (req, res, next) => {
    try{
        // write url and file name for photo and audio and for each field of the analysis
        // read and delete stuff as well 
        // good night from the past to the future thanks


    // console.log(req.files.photo[0])
    // console.log(req.files.audio[0])
        const analysis = new Analysis(req.body);
        analysis.tags = req.body.tagsInput.split(',');
        if (!req.files.photo[0]){
            analysis.image = {url: 'https://res.cloudinary.com/mo3az/image/upload/v1648640118/ICGroup/towfiqu-barbhuiya-nApaSgkzaxg-unsplash_aiqkkn.jpg', filename: 'Default analysis Image'};
        } else {
            analysis.image = {url: req.files.photo[0].path, filename: req.files.photo[0].filename };
        }
        if (!req.files.audio){
            analysis.audio = null
        } else {
            analysis.audio = {url: req.files.audio[0].path, filename: req.files.audio[0].filename };
        }
        analysis.author = req.body.userID;
        analysis.category = req.body.category;
        await analysis.save();
        res.json({
            success: true,
            analysis: analysis,
            message: "Successfully made a new analysis!"
          })
    } catch (err) {
        console.log(err);
    }
}


// showing single
module.exports.getSingle = async (req, res) => {
    try{
        const analysis = await Analysis.findById(req.params.id).populate('category').populate('author');
        console.log(analysis)
        res.json({
            success: true,
            analysis: analysis,
            message: "analysis retrieved succesfully!"
          })
    } catch (err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
          })
    }
}

// updating single analysis
module.exports.updateSingle = async (req, res) => {
    try {
        console.log(req.body)
        if(!req.files[0]){
            let analysis = await Analysis.findOneAndUpdate({ _id: req.params.id}, {
                $set: {
                    title: req.body.title,
                    tags: req.body.tagsInput.split(','),
                    content: req.body.content,
                    category: req.body.category
                }
            });
            await analysis.save();
            res.status(200).json({
                success: true,
                analysis: analysis,
                message: "Successfully updated analysis!"
              })
        } else {
            let analysis = await Analysis.findOneAndUpdate({ _id: req.params.id}, {
                $set: {
                    title: req.body.title,
                    tags: req.body.tagsInput.split(','),
                    image: {url: req.files[0].path, filename: req.files[0].filename},
                    content: req.body.content,
                    category: req.body.category
                }
            });
            await analysis.save();
            await cloudinary.uploader.destroy(req.body.deletedImage, function(error,result) {
                console.log(result, error) });
            res.status(200).json({
                success: true,
                analysis: analysis,
                message: "Successfully updated analysis!"
              })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
          })
    }
}

// deleting single analysis
module.exports.deleteSingle = async (req, res) => {
    try {
        console.log(req.params.id)
        let deletedAnalysis = await Analysis.findOneAndDelete(req.params.id);
        if (deletedAnalysis){
            await cloudinary.uploader.destroy(deletedAnalysis.image.filename, function(error,result) {
                console.log(result, error) });
            res.status(200).json({
                success: true,
                message: "Successfully deleted Analysis!"
              })
            }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
          })
    }
}