const buyerSchema = require('../Schema/BuyerSchema');
const vehicleSchema = require('../Schema/VehicleSchema');
const bcrypt = require('bcrypt');

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
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          user.password = hashedPassword;
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
    
    
}


module.exports = buyerController;