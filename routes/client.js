const MongoClient = require('mongodb').MongoClient;

let client = async function() {
   try {
    // read only on collection User's URI   
    let uri = 'mongodb+srv://monster_user:1234@cluster0-luguo.gcp.mongodb.net/monsterPage?ssl=true&authSource=admin&w=majority';
    const client = new MongoClient(uri, { useNewUrlParser: true }); // App crashing on heruku with 'useUnifiedTopology: true'
    await client.connect();
    return client
   }
   catch (e) {
      console.log(e)
   }
}

module.exports = client;