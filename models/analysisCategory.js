const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnalysisCategorySchema = new Schema({
    type: { 
        type: String, 
        unique: true, 
        required: true 
    },
    ar:{ type: String }

});

module.exports = mongoose.model('analysisCategory', AnalysisCategorySchema);