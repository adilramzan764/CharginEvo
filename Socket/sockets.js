const { Server } = require("socket.io");



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
        console.log(bookingsData);
        const { doctorId, patientName, diagnosis, patientId, RequestType, fees, time, date,hospitableName} = bookingsData;
    
        const doctor = await doctorSchema.findById(doctorId);
        const patient = await patientSchema.findById(patientId);    
        if (!doctor) {          
          socket.emit('bookingError', { message: "Doctor not found" });
          return;
        }
    
        const request = new Requests({
          doctorId: doctorId,
          doctorName: doctor.name,
          doctorImage: doctor.profileImage,
          patientPhone:patient.name,
          patientEmail:patient.email,
          doctorSpecialization:  doctor.specialization,
          hospitableName:hospitableName,
          patientName: patientName,
          diagnosis: diagnosis,
          patientId: patientId, 
          RequestType: RequestType,
          fees: fees,
          time: time,
          date: date,
        });
    
        await request.save();    
        console.log('Request saved:', request);
        io.emit(doctorId, request);
      } catch (error) {
        console.error('Error processing booking:', error);
       
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
