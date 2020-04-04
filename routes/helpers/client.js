const MongoClient = require('mongodb').MongoClient;

let client = async function(uri) {
   try { 
    const client = new MongoClient(uri, { useNewUrlParser: true }); // App crashing on heruku with 'useUnifiedTopology: true'
    await client.connect();
    return client
   }
   catch (e) {
      console.log(e)
   }
}

module.exports = client;