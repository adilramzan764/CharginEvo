const mongoose = require('mongoose');
const { Schema } = mongoose;

const sellerSchema = new Schema({   
    firstName: {
        required: true,
        type: String
    },
    lastName: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String,
        unique : true
    },
    password: {
        required: true,
        type: String
    },
    phone: {
        required: true,
        type: String
    },
    profileImage: {
        required: true,
        type: String
    },

    station:{
        required : false,
        type: Schema.Types.ObjectId,
        ref: 'Station' 
    },
    token: {
        type: String,
      },



}, {
    timestamps: true
});

module.exports = mongoose.model('Seller', sellerSchema); // Use 'Seller' instead of 'sellerSchema'
