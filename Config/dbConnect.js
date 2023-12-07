const mongoose = require('mongoose');


const dbConnect= async () =>{
    try{

        const dbName = 'EvoChargings'; 
        const connect = mongoose.connect(`mongodb+srv://chargeshare390:OF6NqrWOiXSspYsx@cluster0.bgiqqkb.mongodb.net/${dbName}?retryWrites=true&w=majority`);
                console.log('Database connected to host:'+(await connect).connection.host);
    }catch(e){
        console.log(e);
    }
}
// mongodb+srv://chargeshare390:<password>@cluster0.bgiqqkb.mongodb.net/${dbName}?retryWrites=true&w=majority

module.exports = dbConnect;