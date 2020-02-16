const express = require('express');
const router = express.Router();
const invokeClient= require('./client');

// GET Monsters Page, fill list from server */
router.get('/list', async function(req, res, next) {
  const cursor = await getList('list');
  res.render('monsters',{ list: cursor }); 
});

/* GET Individual entry. */
router.get('/entry', async function(req, res, next) {
  let id = req.query.valor;
  const list = await getList('list');
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
let cache = { 'date': 0 };
async function getList(input) {
    let cursor = null
    let one_day = 1000*60*60*24;
    let stored_by = cache['date'] - new Date;
    // check if the input has been calaculated already and stored in cache
    if(cache[input] && stored_by < one_day) {
      console.log('Brought from cache')
      return cache[input] // return the result in the cache
    }
    // if not do the operation and store the result
    else {
      cursor = await queryAtlas();
      console.log('Brought from Atlas')
      cache[input] = cursor; // store the result with the input as key
      cache['date'] = new Date; // store the result with the input as key
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
