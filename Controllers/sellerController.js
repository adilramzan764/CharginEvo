const sellerSchema = require('../Schema/SellerScehma');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const StationSchema = require('../Schema/stationSchema');
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

            if (seller.password !== password) {
              console.log("Invalid Password");
              return res.status(401).json({ error: 'Invalid password' });
            }
          
            console.log("Login Successful");
                        
            return res.status(200).json({ message: 'Login successful', id: seller._id });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ error:  error.message });
          
          
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
            const user = new sellerSchema({
                firstName: firstname,
                lastName: lastname,
                email: email,
                password: password,
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
        console.log("station");
        try {
            const { userId, serviceHours, numberOfChargingSpots, perHourPrice, ParkingPrice, amenities, namesOfChargingSpots } = req.body;
    
            // Check if any required fields are empty
            if (!userId || !serviceHours || !numberOfChargingSpots || !perHourPrice  || !amenities || !namesOfChargingSpots) {
                return res.status(400).json({ message: 'Please fill in all required fields' });
            }
    
            // Check if userId is provided
            if (!userId) {
                return res.status(400).json({ error: 'User Id is not provided' });
            }
    
            const userExists = await sellerSchema.findById(userId); // Find the user by ID
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


    
            const savedStation = await station.save(); // Save the station

            // Associate the station with the user and save the user
            userExists.station = savedStation._id;
            await userExists.save(); // Save the user with the associated station ID
    
            res.status(200).json({ message: 'Station created and associated with the user successfully', savedStation });
        } catch (error) {
            console.error(error.message);
            console.error("there is the seller");

            res.status(500).json({ message: error.message });
        }
    },
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
            const { userId, firstName, lastName, email, password, phone } = req.body;
            
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
                // Code for handling profile image upload and URL generation
    
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
            return res.status(200).json({userExists});
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
    },
    

  
    
    
}


module.exports = sellerController;