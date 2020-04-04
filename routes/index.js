const express = require('express');
const router = express.Router();
const query = require('./helpers/query')
const cache = require('./helpers/cache').check

// URIs
const m_uri = 'mongodb+srv://monster_user:1234@cluster0-luguo.gcp.mongodb.net/monsterPage?ssl=true&authSource=admin&w=majority';
const f_uri = 'mongodb+srv://monster_forum:1234@cluster0-luguo.gcp.mongodb.net/monsterPage?ssl=true&authSource=admin&w=majority';

/* GET home page, cache users list */
router.get('/', async function(req, res) {
  res.render('home');
  //after 'home' is rendered cache 'users' list and 'monsters' list
  const args4users = [f_uri,'users','aggregate',[{ $match: { "isVerified": true } },{ $project: { "_id": 0, "name": 1, "email": 1 } }]];
  await cache('users',query,args4users);
  const args4monsters = [m_uri,'monsters','find','{}'];
  await cache('list',query,args4monsters);
});

/* GET about page. */
router.get('/about', function(req, res) {
  res.render('about');
});

/* GET forum page. */
router.get('/forum', function(req, res) {
  res.render('forum');
});

/* GET check sesion status */
router.get('/checkStatus', function(req, res) {
 try { 
 let result = new Object(); 
  const id = req.session.userID;
  const name = req.session.name;
  const mail = req.session.email;
  if (id) {
   result['logged'] = true;
   result['id'] = id;
   result['name'] = name;
   result['mail'] = mail;
  }
  else {
   result['logged'] = false;
  }
  res.json(result)
 }
 catch (e) {
   console.log(e)
 } 
});

module.exports = router;