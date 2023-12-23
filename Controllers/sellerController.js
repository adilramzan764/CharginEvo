const sellerSchema = require('../Schema/SellerScehma');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const StationSchema = require('../Schema/stationSchema');
const   { bookingInfoSchema, chargingSpotSchema } = require('../Schema/ChargingSpotSchema')
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=chargingdata;AccountKey=bMDS4ZcMoJNwIFxBvrA2K8U3PwUghSmNKkdSTL+9p55l7YWBmjZc5xKpUt5Y1RwiqiTGjqPMxBPG+AStTqILHA==;EndpointSuffix=core.windows.net'; // Replace with your actual connection string
const containerName = 'sellerdata'; // Replace with your desired container name
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);
const bcrypt = require('bcrypt');

const sellerController = {
    async sellerlogin(req, res) {
        console.log("Seller Login");
        try {
          const { email, password } = req.body;
      
          if (!email || !password) {
            return res.status(400).json({ error: 'Required Fields are not given' });
          }
      
          const seller = await sellerSchema.findOne({ email });
          if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
          }
      
          // Compare hashed password
          const isPasswordValid = await bcrypt.compare(password, seller.password);
          if (!isPasswordValid) {
            console.log("Invalid Password");
            return res.status(401).json({ error: 'Invalid password' });
          }
      
          console.log("Login Successful");
      
          return res.status(200).json({ message: 'Login successful', id: seller._id });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: error.message });
        }
      },
    async sellerSignUpPersonal(req, res) {
        console.log("somgthign")
        try {
            const { firstname, lastname, email, password, phone } = req.body;
            console.log(req.body)
    
            // Check if any required fields are empty
            if (!firstname || !lastname || !email || !password || !phone) {
                console.log(firstname)
                console.log('Please fill in all required fields')
                return res.status(400).json({ message: 'Please fill in all required fields' });
            }
            console.log(firstname)

            console.log(req.file)
            if (!req.file) {
                console.log(3);
                return res.status(400).json({ error: 'No profile image found' });
            }
            const existingUserByEmail = await sellerSchema.findOne({ email });
            if (existingUserByEmail) {
                return res.status(409).json({ message: 'User with this email already exists' });
            }
            const profileImage = req.file;
            const profileImageBlobName = `${uuidv4()}-profile-${Date.now()}.jpg`; // Generating a unique name based on timestamp
            const profileImageBlockBlobClient = containerClient.getBlockBlobClient(profileImageBlobName);
            const profileImageBuffer = Uint8Array.from(profileImage.buffer);
            await profileImageBlockBlobClient.uploadData(profileImageBuffer, profileImageBuffer.length);
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new sellerSchema({
                firstName: firstname,
                lastName: lastname,
                email: email,
                password: hashedPassword,
                phone: phone,
                profileImage: profileImageBlockBlobClient.url, // Store the image URL

            });
    
            user.save()
                .then(savedUser => {
                    res.status(200).json({ message: 'User created successfully', savedUser });
                })
                .catch(error => {
                    console.error(error);
                    res.status(500).json({ message: error.message });
                });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },
    async sellerSignUpStation(req, res) {
        try {
            const { userId, serviceHours, numberOfChargingSpots, perHourPrice, ParkingPrice, amenities, namesOfChargingSpots } = req.body;
    
            if (!userId || !serviceHours || !numberOfChargingSpots || !perHourPrice || !amenities || !namesOfChargingSpots) {
                return res.status(400).json({ message: 'Please fill in all required fields' });
            }
    
            const userExists = await sellerSchema.findById(userId);
            if (!userExists) {
                return res.status(404).json({ message: "User not found" });
            }
            const station = new StationSchema({
                serviceHours,
                numberOfChargingSpots,
                namesOfChargingSpots,
                perHourPrice,
                ParkingPrice,
                amenities,
            });
            const savedStation = await station.save();
    
            // Associate the station with the user and save the user
            userExists.station = savedStation._id;
            await userExists.save();
            const numberOfSpots = parseInt(numberOfChargingSpots);
    
            const chargingSpots = [];
    
            for (let i = 0; i < numberOfSpots; i++) {
                const spot = new chargingSpotSchema({
                    spotName: namesOfChargingSpots[i],
                    spotNumber: i + 1,
                    station: savedStation._id
                });
                chargingSpots.push(spot);
            }
    
            const savedSpots = await chargingSpotSchema.insertMany(chargingSpots);
                // If you need to associate spots with a station, you would create the station here and associate the spots with it
            // const station = new Station({
            //     serviceHours,
            //     numberOfChargingSpots,
            //     namesOfChargingSpots,
            //     perHourPrice,
            //     ParkingPrice,
            //     amenities,
            //     chargingSpots: savedSpots.map(spot => spot._id) // Associate spots with the station
            // });
            // const savedStation = await station.save();    
            // Associate the station with the user and save the user
            // userExists.station = savedStation._id;
            // await userExists.save();
    
            res.status(200).json({ message: 'Station created and associated with the user successfully', chargingSpots: savedSpots });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
    },
    // async getSellerStationSpots(req, res) {
    //     try {
    //         const sellerid = req.params.sellerid;
    //         const userExists = await sellerSchema.findById(sellerid);
    //         if (!userExists) {
    //             return res.status(404).json({ message: "Seller not found" });
    //         }
    //         const stationId = userExists.station;
    //         const spots = await chargingSpotSchema.find({station : stationId});

    //         return res.status(200).json({spots});
    //     } catch (error) {
    //         console.log(error);
    //         return res.status(500).json({ error: error.message });
    //     }
    // },
    // async bookInStation(req, res) {
    //     try {
    //         const spotId = req.params.spotId;
    //         const spotExists = await chargingSpotSchema.findById(spotId);
    
    //         if (!spotExists) {
    //             return res.status(400).json({ message: "Spot not found" });
    //         }
    
    //         const { startedAt, duration, units  , station , chargingPrice,parkingPrice , buyer} = req.body;
    
    //         if (!startedAt || !duration || !units || !station || !chargingPrice || !parkingPrice || !buyer) {
    //             return res.status(400).json({ message: "Required Fields are not given" });
    //         }
    
    //         // Check if the spot is available at the specified start time
    //         const overlappingBooking = spotExists.bookingInfo.find(booking => {
    //             const existingStart = new Date(booking.startedAt).getTime();
    //             const newStart = new Date(startedAt).getTime();
    //             const existingEnd = existingStart + (parseInt(booking.duration) * 60 * 60 * 1000);
    //             const durationInHours = parseInt(duration);
    //             const newEnd = newStart + (durationInHours * 60 * 60 * 1000); // Calculate the end time based on the provided duration in hours
    //                             return (
    //                 (newStart >= existingStart && newStart < existingEnd) ||
    //                 (newEnd > existingStart && newEnd <= existingEnd) ||
    //                 (newStart <= existingStart && newEnd >= existingEnd)
    //             );
    //         });
            
    //         // const overlappingBooking = spotExists.bookingInfo.find(booking => {
    //         //     const existingStart = new Date(booking.startedAt).getTime();
    //         //     const newStart = new Date(startedAt).getTime();
    //         //     const existingEnd = existingStart + (parseInt(booking.duration) * 60 * 60 * 1000);
    //         //     const newEnd = newStart + (parseInt(duration) * 60 * 60 * 1000);
    //         //     return (
    //         //         (newStart >= existingStart && newStart < existingEnd) ||
    //         //         (newEnd > existingStart && newEnd <= existingEnd) ||
    //         //         (newStart <= existingStart && newEnd >= existingEnd)
    //         //     );
    //         // });
    
    //         if (overlappingBooking) {
    //             return res.status(400).json({ message: "Spot already booked for the specified time" });
    //         }
    
    //         const newBooking = new bookingInfoSchema({
    //             startedAt: startedAt,
    //             duration: duration,
    //             units: units,
    //             buyer: buyer,
    //             station: station,
    //             chargingPrice:chargingPrice,
    //             parkingPrice: parkingPrice
    //         });    
    //         await newBooking.save();
    //         spotExists.bookingInfo.push(newBooking);
    //         await spotExists.save();    
    //         return res.status(200).json({ message: "Booking information added successfully", spotExists });
    //     } catch (error) {
    //         console.log(error);
    //         return res.status(500).json({ error: error.message });
    //     }
    // },

    async bookInStation(req, res) {
        try {
            const spotId = req.params.spotId;
            const spotExists = await chargingSpotSchema.findById(spotId);
    
            if (!spotExists) {
                return res.status(400).json({ message: "Spot not found" });
            }
    
            const { startedAt, duration, units, station, chargingPrice, parkingPrice, buyer } = req.body;
    
            if (!startedAt || !duration || !units || !station || !chargingPrice || !parkingPrice || !buyer) {
                return res.status(400).json({ message: "Required Fields are not given" });
            }
    
            // Check if the spot is available at the specified start time
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
                return res.status(400).json({ message: "Spot already booked for the specified time" });
            }
    
            const newBooking = new bookingInfoSchema({
                startedAt: startedAt,
                duration: duration,
                units: units,
                buyer: buyer,
                station: station,
                chargingPrice: chargingPrice,
                parkingPrice: parkingPrice
            });
            await newBooking.save();
            spotExists.bookingInfo.push(newBooking);
            await spotExists.save();
            return res.status(200).json({ message: "Booking information added successfully", spotExists });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
    },

    //get the pending orders by stationId order
    async getOrdersById(req, res) {
        try{
            const stationId = req.params.stationId;
            const orders = await bookingInfoSchema.find({
                station: stationId,

            });
            if (!orders) {
                return res.status(404).json({ message: "orders not found" });
            }

            return res.status(200).json({ orders });

            

        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
    },
    


    
    // async bookInStation(req, res) {
    //     try {
    //         const spotId = req.params.spotId;
    //         console.log(spotId)
    //         const spotExists = await chargingSpotSchema.findById(spotId);
    
    //         if (!spotExists) {
    //             return res.status(400).json({ message: "Spot not found" });
    //         }
    
    //         console.log(req.body);
    //         const { startedAt, duration, units } = req.body;
    
    //         if (!startedAt || !duration || !units) {
    //             return res.status(400).json({ message: "Required Fields are not given" });
    //         }
    
    //         const newBooking = new bookingInfoSchema({
    //             startedAt: startedAt,
    //             duration: duration,
    //             units: units,
    //         });
    
    //         newBooking.save();
    //         spotExists.bookingInfo.push(newBooking);
    //         await spotExists.save();
    
    //         return res.status(200).json({ message: "Booking information added successfully", spotExists });
    //     } catch (error) {
    //         console.log(error);
    //         return res.status(500).json({ error: error.message });
    //     }
    // },
    
    
    async sellerchangePassword(req, res) {
        try {
            const { userId, newPassword } = req.body;
            console.log( req.body);
    
            if (!userId || !newPassword) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }
    
            const user = await sellerSchema.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            // Hash the new password before saving it
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();
    
            return res.status(200).json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error changing password' });
        }
    },
    async sellerInfoUpdate(req, res) {
        try {
            console.log(req.body);
            const { userId, firstName, lastName, email, password, phone } = req.body;
            console.log(req.body)
            console.log(userId)
            if (!userId) {
                return res.status(400).json({ error: 'userId is missing' });
            }
    
            const user = await sellerSchema.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            const updateFields = {};
            if (firstName) updateFields.firstName = firstName;
            if (lastName) updateFields.lastName = lastName;
            if (email) updateFields.email = email;
            if (password) updateFields.password = password;
            if (phone) updateFields.phone = phone;
    
        
            // Handle profile image separately if it's provided in the request
            if (req.file) {
                const profileImage = req.file;
                const profileImageBlobName = `${uuidv4()}-profile-${Date.now()}.jpg`; // Generating a unique name based on timestamp
                const profileImageBlockBlobClient = containerClient.getBlockBlobClient(profileImageBlobName);
                const profileImageBuffer = Uint8Array.from(profileImage.buffer);
                await profileImageBlockBlobClient.uploadData(profileImageBuffer, profileImageBuffer.length);
    
                updateFields.profileImage = profileImageBlockBlobClient.url; // Store the image URL
            }
    
            await sellerSchema.findByIdAndUpdate(userId, { $set: updateFields });
    
            res.status(200).json({ message: 'User Info Updated successfully' });
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error updating user info' });
        }
    },
    
    async addLocationToStation(req, res) {
        console.log("station");
        try {
            const { stationId, location,  } = req.body;
    
            // Check if any required fields are empty
            if (!stationId || !location) {
                return res.status(400).json({ message: 'Please fill in all required fields' });
            } 
            const station =  await StationSchema.findById(stationId);

    
            station.location = location;
           await station.save(); // Save the station
            res.status(200).json({ message: 'location added successfully'});
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    async getSellerInfo(req, res) {
        try {
            const sellerid = req.params.sellerid;
            const userExists = await sellerSchema.findById(sellerid);
            if (!userExists) {
                return res.status(404).json({ message: "Seller not found" });
            }
            // if (!userExists) {
            //     return res.status(404).json({ message: "Seller not found" });
            // }
            const stationId = userExists.station;
            const spots = await chargingSpotSchema.find({station : stationId});
            return res.status(200).json({user :userExists, spots:spots });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
    },
    

  
    
    



    
    // Run the cleanup function periodically, for example, every hour
    
}


    //testing purpose only to remove the spots which are completed or expire

    async function removeExpiredBookings() {
        try {
            const currentTime = new Date();
            const expiredBookings = await bookingInfoSchema.find({ startedAt: { $lt: currentTime } });
    
            for (const booking of expiredBookings) {
                // Perform any necessary actions for the expired booking
                // For example, remove the booking from the associated spot
                await chargingSpotSchema.updateOne(
                    { 'bookingInfo._id': booking._id },
                    { $pull: { bookingInfo: { _id: booking._id } } }
                );
                // Or directly remove the booking from the bookingInfo collection
                await bookingInfoSchema.deleteOne({ _id: booking._id });
            }
        } catch (error) {
            console.error("Error removing expired bookings:", error);
        }
    }
setInterval(removeExpiredBookings, 60 * 60 * 1000); // Run every hour

module.exports = sellerController;