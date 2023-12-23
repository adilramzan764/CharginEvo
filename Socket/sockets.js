const { Server } = require("socket.io");
const   { bookingInfoSchema, chargingSpotSchema } = require('../Schema/ChargingSpotSchema')



module.exports = function attachSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["*"],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join', (room) => {
      console.log(`Joining room ${room}`);
      socket.join(room);
    });
  
    console.log('New client connected');
  
    socket.on('bookings', async (bookingsData) => {
      try {
        const { spotId, startedAt, duration, units,
          stationId, chargingPrice, parkingPrice, buyerId,buyerName,buyerPhone ,chargerType,carName } = bookingsData;
           if (!startedAt || !duration || !units || !stationId || 
            !chargingPrice || !parkingPrice || !buyerId || !buyerName || !buyerPhone || !chargerType || !carName )  {
            io.emit(stationId, { message: "Required Fields are not given" });
            return; // Halt execution if spot is not found

        }
        const spotExists = await chargingSpotSchema.findById(spotId);
        console.log("here is station id:" , stationId);
        if (!spotExists) {
          io.emit(stationId, { message: "Spot not found" });
          return; // Halt execution if spot is not found

        }
        const overlappingBooking = spotExists.bookingInfo.find(booking => {
            const existingStart = new Date(booking.startedAt).getTime();
            const newStart = new Date(startedAt).getTime();
            const existingEnd = existingStart + (parseInt(booking.duration) * 60 * 60 * 1000);
            const durationInHours = parseInt(duration);
            const newEnd = newStart + (durationInHours * 60 * 60 * 1000); // Calculate the end time based on the provided duration in hours
            return (
                (newStart >= existingStart && newStart < existingEnd) ||
                (newEnd > existingStart && newEnd <= existingEnd) ||
                (newStart <= existingStart && newEnd >= existingEnd)
            );
        });

        if (overlappingBooking) {
          io.emit(stationId, { message: "Spot already booked for the specified time" });
          return; // Halt execution if spot is not found
        }
        console.log("Not booked")
        const newBooking = new bookingInfoSchema({
            startedAt: startedAt,
            duration: duration,
            units: units,
            buyerId: buyerId,
            stationId: stationId,
            chargingPrice: chargingPrice,
            parkingPrice: parkingPrice,
            buyerName:buyerName,
            buyerPhone:buyerPhone,
            chargerType:chargerType,
            carName:carName


        });
        await newBooking.save();
        spotExists.bookingInfo.push(newBooking);
        await spotExists.save();
        io.emit(stationId, { message: "Booking information added successfully", spotExists });
        return; // Halt execution if spot is not found

    } catch (error) {
        console.log(error);
        io.emit(stationId, {  error: error.message });
    }
    });   

  
    // socket.on("CancelR", async (data) => {
    //   const { id } = data;
    //   const apiUrl = `http://192.168.1.13:5000/CancelRequestsbyid/${id}`;
    
    //   // Now, you can use the apiUrl for your HTTP request
    //   // For example, using Axios:
    //   axios.post(apiUrl)
    //     .then(response => {
    //       console.log('Request canceled successfully');
    //     })
    //     .catch(error => {
    //       console.error('An error occurred while canceling the request:', error);
    //     });
    // });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};
