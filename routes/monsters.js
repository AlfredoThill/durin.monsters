const express = require('express');
const router = express.Router();
const invokeClient= require('./client');
const sample = require('../public/sample.json'); //off line

// GET Monsters Page, fill list from server */
router.get('/list', async function(req, res, next) {
  const cursor = sample; //off line 
  // const cursor = await getList();
  res.render('monsters',{ list: cursor }); 
});

/* GET Individual entry. */
router.get('/entry', async function(req, res, next) {
  let id = req.query.valor;
  const list = sample; //off line 
  // const list = await getList();
  let document;
  for (doc of list) {
    if (doc._id == id) {
      document = doc;
      break
    }
  }
  res.render('entry', { entry: document });
});

module.exports = router;

// Cache 'monsters' collection 
let cache = {};
async function getList(input) {
    let cursor = null
    // check if the input has been calaculated already and stored in cache
    if(cache[input]) {
      console.log('Brought from cache')
      return cache[input] // return the result in the cache
    }
    // if not do the operation and store the result
    else {
      cursor = await queryAtlas();
      console.log('Brought from Atlas')
      cache[input] = cursor; // store the result with the input as key
    }
    return cursor
}
// Get 'monsters' collection from atlas
async function queryAtlas() {
  const client = await invokeClient();
  let cursor;
    try {
      const collection = client.db('monsterPage').collection("monsters");
      cursor = await collection.find().toArray();
    }
    catch (e) {
      console.log(e); 
    }
    finally {
      client.close();
    }   
    return cursor  
}
