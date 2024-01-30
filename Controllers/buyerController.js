const buyerSchema = require('../Schema/BuyerSchema');
const vehicleSchema = require('../Schema/VehicleSchema');
const stationSchema = require('../Schema/stationSchema');
const { BlobServiceClient } = require('@azure/storage-blob');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const   { bookingInfoSchema, chargingSpotSchema } = require('../Schema/ChargingSpotSchema')
const VehicleSchema = require('../Schema/VehicleSchema');
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=chargingdata;AccountKey=bMDS4ZcMoJNwIFxBvrA2K8U3PwUghSmNKkdSTL+9p55l7YWBmjZc5xKpUt5Y1RwiqiTGjqPMxBPG+AStTqILHA==;EndpointSuffix=core.windows.net'; // Replace with your actual connection string
const containerName = 'buyerdata'; // Replace with your desired container name
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

const buyerController = {
    async buyerlogin(req, res) {
        console.log("Buyer Login");
        try {
            const { email, password } = req.body;
          
            if (!email || !password) {
              return res.status(400).json({ error: 'Required Fields are not given' });
            }
          
            const buyer = await buyerSchema.findOne({ email });
            if (!buyer) {
              return res.status(404).json({ error: 'User not found' });
            }

            if (buyer.password !== password) {
              console.log("Invalid Password");
              return res.status(401).json({ error: 'Invalid password' });
            }
          
            console.log("Login Successful");
                        
            return res.status(200).json({ message: 'Login successful', id: buyer._id });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ error:  error.message });
          
          
          }

          
          
    },
      async buyerSignUp(req, res) {
        try {
            const { firstname, lastname, email, password, phone } = req.body;
    
            // Check if any required fields are empty
            if (!firstname || !lastname || !email || !password || !phone) {
                return res.status(400).json({ message: 'Please fill in all required fields' });
            }
    
            const existingUserByEmail = await buyerSchema.findOne({ email });
            if (existingUserByEmail) {
                return res.status(409).json({ message: 'User with this email already exists' });
            }
    
         
            const user = new buyerSchema({
                firstName: firstname,
                lastName: lastname,
                email: email,
                password: password,
                phone: phone,
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
    async  getBuyerInfo(req, res) {
        try {
            const buyerId = req.params.buyerId;
            const userExists = await buyerSchema.findById(buyerId).populate('Cars'); // Ensure Cars field is populated
            if (!userExists) {
                return res.status(404).json({ message: "Buyer not found" });
            }

    
            // console.log(userExists.Cars); // Ensure Cars field holds the expected data
    
            // const cardata = await VehicleSchema.findById(userExists.Cars); // Assuming Car is the model name
            // console.log(cardata);
    
            // // Assign the fetched car data to the user's car field
            // // userExists.car = cardata;
            // await userExists.save(); // Save the changes
    
            return res.status(200).json({ userExists });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
    }
    ,    
    
    async buyerInfoUpdate(req, res) {
        try {
            const { userId, firstName, lastName, email, password, phone } = req.body;
            
            if (!userId) {
                return res.status(400).json({ error: 'userId is missing' });
            }
    
            console.log("Hello")
            console.log(userId)

            const user = await buyerSchema.findById(userId);
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
            await buyerSchema.findByIdAndUpdate(userId, { $set: updateFields });
    
            res.status(200).json({ message: 'User Info Updated successfully' });
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error updating user info' });
        }
    },
    async getBuyerOrdersById(req, res) {
        try{
            const userId = req.params.userId;
            const orders = await bookingInfoSchema.find({
                buyerId: userId,

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
    async buyerchangePassword(req, res) {
      try {
          const { userId, newPassword } = req.body;
  
          if (!userId || !newPassword) {
              return res.status(400).json({ error: 'Required fields are missing' });
          }
  
          const user = await buyerSchema.findById(userId);
          if (!user) {
              return res.status(404).json({ error: 'User not found' });
          }
  
          // Hash the new password before saving it
        //   const hashedPassword = await bcrypt.hash(newPassword, 10);
          user.password = newPassword;
          await user.save();
  
          return res.status(200).json({ message: 'Password changed successfully' });
      } catch (error) {
          console.error(error);
          return res.status(500).json({ error: 'Error changing password' });
      }
  },
    async buyerVehicleAdd(req, res) {
      try {
          const {
              userId,
              brand,
              model,
              trim,
              batteryCapacity,
          } = req.body;
  
          if(!req.body. userId){
              return res.status(400).json({ error: 'User Id is not given' });

          }
           
          if (!req.body.userId  || !req.body.brand,!req.body.model,!req.body.trim,
              !req.body.batteryCapacity) {
              return res.status(400).json({ error: 'Required Fields are not given' });
          }
          // Check if the user (doctor) exists
          const userExists = await buyerSchema.findById( userId );
          if (!userExists) {
              return res.status(404).json({ message: "User not found" });
          }
  
        
          // Create the new clinic
          const newVehicle = await vehicleSchema.create({
              brand,
              model,
              trim,
              batteryCapacity,
          });
  
          // Add the newly created clinic to the user's clinics array
          userExists.Cars = newVehicle._id;
          await userExists.save();
  
          return res.status(200).json({message : "Vahicle Added Successfuly"});
      } catch (error) {
          console.log(error);
          return res.status(500).json({ error: error.message });
      }
  },
  async getstationbychargertype(req, res) {
    try {
        const spotName = req.params.spotName
        // const sations = await stationSchema.find();
        console.log(spotName)
        const stations = await chargingSpotSchema.find({spotName:spotName });
        if (stations.length === 0) {
            return res.status(404).json({ message: "No stations found for the given spot name." });
        }
        return res.status(200).json({Stations : stations});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
},
async getstationbyId(req, res) {
    try {
        const stationId = req.params.stationId; 
        const stations = await stationSchema.find({_id :stationId });
        console.log(stationId)
        const spots = await chargingSpotSchema.find({station:stationId });
        if (stations.length === 0) {
            return res.status(404).json({ message: "No stations found." });
        }
        return res.status(200).json({Stations : stations,spots:spots});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
},
// chargingSpotSchema

async getAllchargingScema(req, res) {
    try {
        const sations = await chargingSpotSchema.find();
        return res.status(200).json({spots : sations});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
}

    
    
}


module.exports = buyerController;