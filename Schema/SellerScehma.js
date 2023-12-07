const mongoose = require('mongoose');

const { Schema } = mongoose;

const stationSchema = new Schema({   
   serviceHours: {
       required: true,
       type: String
   },
   numberOfChargingSpots: {
       required: true,
       type: String
   },
   perHourPrice: {
    required: true,
    type: String,
   },
   ParkingPrice: {
    required: false,
    type: String,
   },
   amenities: {
    required: true,
    type: [String]
  }, 

}, {
   timestamps: true
});

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

    stationSchema:{
        required : false,
        type:stationSchema
    },
    token: {
        type: String,
      },



}, {
    timestamps: true
});

module.exports = mongoose.model('Seller', sellerSchema); // Use 'Seller' instead of 'sellerSchema'
