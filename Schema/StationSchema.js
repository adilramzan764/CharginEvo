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
    namesOfChargingSpots: {
     required: true,
     type: [String]
   }, 
   chargingSpots: [{
    type: Schema.Types.ObjectId,
    ref: 'ChargingSpot',
  }],
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
   location:{
    required: false,
    type: String

  }
 
 }, {
    timestamps: true
 });



 
const chargingSpotSchema = new Schema({
  station: {
    type: Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  spotNumber: {
    type: Number,
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });


 module.exports = mongoose.model('Sation', stationSchema); 
