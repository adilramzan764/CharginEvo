const express = require('express');
const app = express();
const cors = require("cors");
const dbConnect = require('./Config/dbConnect');
// const http = require('http').createServer(app);
// const attachSocket = require('./SocketsC/socket'); // Import the function from socket.js
// const dbConnect = require('./database/dbconnect');
const buyerRouter = require('./routes/buyerRoutes');
const port= process.env.PORT || 5000
dbConnect();
app.use(express.json());
app.use(cors());
app.use(buyerRouter);
app.get('/', (req, res) => {
  res.send('Hello from Charging evo');
});
// attachSocket(http); // Passing the http server to the function here
app.listen(port, () => {
  console.log(`Server listening on port: ${port} 🛡️`);
});


