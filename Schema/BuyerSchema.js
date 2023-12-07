const mongoose = require('mongoose');
const { Schema } = mongoose;

const buyerSchema = new Schema({   
     firstName: {
        required: true,
        type: String
    },
    lastName: {
        required: true,
        type: String,
    },
    password: {
        required: true,
        type: String
    },
    phone: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String
    },

    Cars: {
        type: Schema.Types.ObjectId,
        ref: 'Car'
        
    },
    token: {
        type: String,
      },

}, {
    timestamps: true
});

module.exports = mongoose.model('Buyer', buyerSchema); 
