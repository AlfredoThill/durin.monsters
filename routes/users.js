const express = require('express');
const router = express.Router();
const query = require('./helpers/query');
const cache = require('./helpers/cache').check;
const encrypt = require('./helpers/encryption');
const validation = require('./helpers/signUpvalidation');
const sendEmail = require('./helpers/sendMail');
const ObjectId = require('mongodb').ObjectID;

// URI
const f_uri = 'mongodb+srv://monster_forum:1234@cluster0-luguo.gcp.mongodb.net/monsterPage?ssl=true&authSource=admin&w=majority';

/* POST login */
router.post('/login', async function(req, res) {
    const mail = req.body['login-mail'];
    const pwd = encrypt(req.body['login-pwd']); 
    let find = await query(f_uri,'users','find',{ 'isVerified': true, 'email': mail , 'password': pwd });
    let result = {};
    if (find.length > 0) { // credenciales correctas 
        req.session.userID = find[0]['_id'];  
        req.session.email = mail;
        req.session.name = find[0].name;
        result = { logged: true, name: find[0].name, userID:  req.session.userID };
    }
    else { // credenciales incorrectas
        let msg;
        let check = await query(f_uri,'users','find',{ 'email': mail });
        if (check.length > 0) {
          if (check[0].isVerified == false) { msg = 'Account pending verification.'}
          else { msg = 'Wrong password.'}
        }
        else { msg = 'Email not registered.'}
        result = { logged: false, msg: msg };
    }
    res.json(result)
});

/* GET cancel login/signin or logout */
router.get('/out', function (req, res) {
    req.session.destroy();
    let backURL = req.header('Referer') || '/' ;
    res.redirect(backURL)
});

/* POST sign in */
router.post('/sign', async function(req, res) {
    const name = req.body['signin-name'];
    const mail = req.body['signin-mail'];
    const pwd = req.body['signin-pwd']; 
    let result = {};
    // check active users
    const args = [f_uri,'users','aggregate',[{ $match: { "isVerified": true } },{ $project: { "_id": 0, "name": 1, "email": 1 } }]];
    await cache('users',query,args);
    // validate new user params
    let err = validation(name,mail,pwd);
     if (err != 'none') { // error al completar formulario de registro
      result = { success: false, msg: err };
      res.json(result);
     }
     else { // inserto usuario nuevo, mando mail y espero confirmacion
      let hash = encrypt(pwd);
      let expiration = new Date();
      expiration.setHours( expiration.getHours() + 1 ); 
      let newdoc = {
          "name": name,
          "email": mail,
          "password": hash,
          "isVerified": false,
          "expire": expiration,
      } 
      let insert = await query(f_uri,'users','insert', newdoc); // insert the unverifed doc
      result = { success: true, title: 'Awaiting Confirmation', msg: 'An email has just been sent to your adress. There you will find a link, click it and you are done!' };
      res.json(result);
      let link = "http:" + req.headers.host + "/users/confirm" + "?id=" + insert.insertedId + "&token=" + hash; 
      const params = { "name": name, "link": link };
      await sendEmail(mail,'sign-in',params); // envio el mail con el hash  
     }
});

/* GET account confirmation */
router.get('/confirm', async function(req, res) {
  // get params from url, link was sent over email to user  
  let id = req.query.id;
  let hash = req.query.token;
  let args = {
    "filter": { "_id": new ObjectId(id), "password": hash },
    "update": { $set: { "isVerified": true } },
  };
  await query(f_uri,'users','update',args); // udpate document, 'verify' account
  req.session.destroy();
  res.redirect('/')
});

/* POST password reset */
router.post('/reset-pwd', async function(req, res) {
  const mail = req.body['reset-mail'];
  let result = {};
  let check = await query(f_uri,'users','find',{ 'isVerified': true, 'email': mail });
  if (check.length > 0) {
    let id = check[0]['_id'];
    let name = check[0].name;
    let rnd = Math.floor(Math.random() * (900000)) + 100000;
    let hash = encrypt(rnd.toString());
    let link = "http:" + req.headers.host + "/users/confirm-reset" + "?id=" + id + "&token=" + hash;
    result = { success: true, title: 'Reset Password Request', msg: "A mail has been sent to the indicated account, there is no change in your password yet. You'll have to confirm the operation and then you will get a new random generated password." };
    res.json(result); 
    const params = { "name": name, "link": link, "pwd": rnd };
    await sendEmail(mail,'pwd-reset',params);
  }
  else {
    result = { success: false, msg: 'The indicated email is not registered.' };
    res.json(result);
  }
}); 

/* POST password reset confirm */
router.get('/confirm-reset', async function(req, res) {
 // get params from url, link was sent over email to user  
 let id = req.query.id;
 let hash = req.query.token;
 try {
   let args = {
    "filter": { "_id": new ObjectId(id) },
    "update": { $set: { "password": hash } },
    };
    await query(f_uri,'users','update',args); // udpate document
  }
  finally { 
  req.session.destroy();
  res.redirect('/')
  } 
}); 

/* POST password change */
router.post('/pwd-change', async function(req, res) {
  const userID = req.session.userID;
  const oldPWD = encrypt(req.body['old-pwd']);
  const newPWD = encrypt(req.body['new-pwd']);
  let result = {};
  let check = await query(f_uri,'users','find',{ 'isVerified': true, '_id': new ObjectId(userID), 'password': oldPWD });
  if (check.length > 0) {
    let args = {
      "filter": { "_id": new ObjectId(userID) },
      "update": { $set: { "password": newPWD } },
      };
    await query(f_uri,'users','update',args); // udpate document
    result = { success: true, title: 'Password Changed', msg: "Your new password is set, this page will auto-reload shortly, login with your new credential." };
    req.session.destroy();
    res.json(result); 
  }
  else {
    result = { success: false, msg: 'The password does not match.' };
    res.json(result);
  }
 }); 

module.exports = router;