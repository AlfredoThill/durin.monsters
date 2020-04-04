const nodemailer = require('nodemailer');
const templates = require('./templating')

let send = async function sendMail(mail,kind,params) {
 let template;
 if (kind == 'sign-in') {
  template = templates.confirmation_mail
 }
 else if (kind == 'pwd-reset') { 
  template = templates.reset_mail 
 }
 let html = template(params);
  try {  
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'pagemonster0@gmail.com',
            pass: 'Centaur1234'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    const mailOptions = { 
        from: 'no-reply@monsterpage.com', 
        to: mail, 
        subject: 'Monster Page - Account Verification', 
        html: html,
        };
    await transporter.sendMail(mailOptions);
    }
  catch (e) {
    console.log('Send Email failed: '+e)
  }   
}

module.exports = send;