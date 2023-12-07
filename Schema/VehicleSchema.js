const mongoose = require('mongoose');
const { Schema } = mongoose;

const carSchema = new Schema({   
  
     brand: {
        required: true,
        type: String
    },
    model : {
        required: true,
        type: String,
        unique : true
    },
    trim: {
        required: true,
        type: String
    },
    batteryCapacity: {
        required: true,
        type: String
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Car', carSchema); 
