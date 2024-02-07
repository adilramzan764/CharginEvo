const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
    stationId:{
        required: true,
        type: String 
    },
    buyerId:{
        required: true,
        type: String 
    },
    buyerImage: {
        required: true,
        type: String
    },
    buyerName: {
        required: true,
        type: String
    },
    reviewRating: {
        required: true,
        type: Number
    },
    reviewBody: {
        required: true,
        type: String
    },
    reviewDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', reviewSchema);
