const express = require('express');
const app = express();
const cors = require("cors");
const http = require('http').createServer(app);
const attachSocket = require('./Socket/sockets')
const dbConnect = require('./Config/dbConnect');
const buyerRouter = require('./routes/buyerRoutes');
const sellerRouter = require('./routes/sellerRoutes');
const port= process.env.PORT || 5000
dbConnect();
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(buyerRouter);
app.use(sellerRouter);
attachSocket(http)
app.get('/', (req, res) => {
  res.send('Hello from Charging evo Making Changes update');
});

//this is dummy change you dumb fuck
http.listen(port, () => {
  console.log(`Server listening on port: ${port} 🛡️`);
});


