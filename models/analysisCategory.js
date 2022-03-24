const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnalysisCategorySchema = new Schema({
    type: { type: String, unique: true, required: true }
});

module.exports = mongoose.model('analysisCategory', AnalysisCategorySchema);