const express= require('express');
const Controllers = require('../Controllers/sellerController');
const Mailer = require('../Utils/Mailer');
const router=express.Router();
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage }); 



router.get('/test',(req,res)=>res.json({mesg:"Hello"}))

//buyer login
router.post('/sellerlogin',Controllers.sellerlogin)
//sellerSignUpPersonal
router.post('/sellerSignUpPersonal',upload.single('profileImage'), Controllers.sellerSignUpPersonal)
//sellerSignUpStation
router.post('/sellerSignUpStation', Controllers.sellerSignUpStation)
//getSellerInfo
router.get('/getSellerInfo/:sellerid', Controllers.getSellerInfo)
//addLocationToStation
router.post('/addLocationToStation', Controllers.addLocationToStation)




module.exports=router;