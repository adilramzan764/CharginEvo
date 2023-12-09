const express = require('express');
const app = express();
const cors = require("cors");
const dbConnect = require('./Config/dbConnect');
const buyerRouter = require('./routes/buyerRoutes');
const sellerRouter = require('./routes/sellerRoutes');

const port= process.env.PORT || 5000
dbConnect();
app.use(express.json());
app.use(cors());
app.use(buyerRouter);
app.use(sellerRouter);

app.get('/', (req, res) => {
  res.send('Hello from Charging evo');
});
// attachSocket(http); // Passing the http server to the function here
app.listen(port, () => {
  console.log(`Server listening on port: ${port} 🛡️`);
});


