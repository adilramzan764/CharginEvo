const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingInfoSchemaa = new Schema({
    stationId: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: false,
        default:"Pending",
        enum : ["Pending" , "Completed", "Cancelled"]
    },
    buyerId: {
        type: String,
        required: false,
    },
    buyerName: {
        type: String,
        required: false,
    },
    buyerPhone: {
        type: String,
        required: false,
    },
    chargerType: {
        type: String,
        required: false,
    },
    carName: {
        type: String,
        required: false,
    },
    startedAt: {
        type: Date, // Change the type to Date for time-related values
        required: true,
    },
    chargingPrice: {
        type: String,
        required: false,
    },
    parkingPrice: {
        type: String, 
        required: false,
    },
    duration: {
        type: String,
        required: true,
    },
    units: {
        type: String,
        required: false,
        default: "12"
    }
}, { timestamps: true });

const chargingSpotSchemaa = new Schema({
    station: {
        type: Schema.Types.ObjectId,
        ref: 'Station',
        required: true,
    },
    spotNumber: {
        type: String,
        required: false,
    },
    spotName: {
        type: String,
        required: false,
    },
    bookedAt: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: false,
        default:"Available",
        enum : ["Available" , "NotAvailable"]
    },
    numberOfHours: {
        type: String,
        required: false,
    },
    bookingInfo: [{
        type: bookingInfoSchemaa, // Embedded bookingInfoSchema objects within the array
        required: false
    }]
}, { timestamps: true });

const bookingInfoSchema = mongoose.model('BookingInfo', bookingInfoSchemaa);
const chargingSpotSchema = mongoose.model('Spot', chargingSpotSchemaa);

module.exports = { chargingSpotSchema, bookingInfoSchema };