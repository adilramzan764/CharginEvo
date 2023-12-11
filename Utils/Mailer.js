const nodemailer = require('nodemailer');
const buyerSchema = require('../Schema/BuyerSchema');

const sendMail = {
    async sendCodeToEmail(req, res) {
        console.log("Getting");
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'inzmamkhan56@gmail.com',
                  pass: "axrfxqiazsjewvih"
                }
              });
            const email = req.params.email;
            const code = req.params.code;
            const buyer = await buyerSchema.findOne({ email });
            if (buyer) {
                return res.status(404).json({ error: 'User Already Exists' });
              }

            // const code = Math.floor(1000 + Math.random() * 9000);
            const mailOptions = {
                from: 'inzmamkhan56@gmail.com',
                to: email,
                subject: 'Verification Code',
                text: `Your verification code is ${code}`
            };        

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                return res.status(200).json({ message: "Code sent to email" });
            });
        } catch (error) {
            return res.status(500).json({ error });
        }
    },
}


module.exports = sendMail;