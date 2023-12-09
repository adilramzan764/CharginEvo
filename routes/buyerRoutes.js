const express= require('express');
const Controllers = require('../Controllers/buyerController');
const Mailer = require('../Utils/Mailer');
const router=express.Router();



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
//getAllStations
router.get('/getAllStations',Controllers.getAllStations)




module.exports=router;