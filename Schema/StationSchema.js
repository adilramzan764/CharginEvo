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



 



 module.exports = mongoose.model('Sation', stationSchema); // Use 'Sation' instead of 'sellerSchema'


