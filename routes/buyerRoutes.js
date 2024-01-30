const express= require('express');
const Controllers = require('../Controllers/buyerController');
const Mailer = require('../Utils/Mailer');
const router=express.Router();
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage }); 


router.get('/test',(req,res)=>res.json({mesg:"Hello"}))

//sendCodeToEmail
router.post('/sendCodeToEmail/:email/:code',Mailer.sendCodeToEmail)
//buyer login
router.post('/login',Controllers.buyerlogin)
//buyerSignUp
router.post('/buyerSignUp',Controllers.buyerSignUp)
//buyerVehicleAdd
router.post('/buyerVehicleAdd',Controllers.buyerVehicleAdd)
//buyerchangePassword
router.post('/buyerchangePassword',Controllers.buyerchangePassword)
//getstationbychargertype
router.get('/getstationbychargertype/:spotName',Controllers.getstationbychargertype)
//getstationbyId
router.get('/getstationbyId/:stationId',Controllers.getstationbyId)

//getBuyerInfo
router.get('/getBuyerInfo/:buyerId',Controllers.getBuyerInfo)
//buyerInfoUpdate
router.patch('/buyerInfoUpdate',upload.single('profileImage') ,Controllers.buyerInfoUpdate)
//getBuyerOrdersById
router.get('/getBuyerOrdersById/:userId', Controllers.getBuyerOrdersById)
//getAllchargingScema
router.get('/getAllchargingScema', Controllers.getAllchargingScema)




module.exports=router;