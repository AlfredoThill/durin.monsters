const invokeClient = require('./client')

// Simple Query Runner
let query = async function queryAtlas(uri,collection_name,operation,params) {
  const client = await invokeClient(uri);
  const collection = client.db('monsterPage').collection(collection_name);  
  let cursor;
    try {
       switch (operation) {
        case 'find':
          cursor = await collection.find(params).toArray(); 
         break
        case 'update':
          cursor = await collection.updateOne(params.filter,params.update);
          break
        case 'insert':
          cursor = await collection.insertOne(params); 
         break
        case 'aggregate': 
          cursor = await collection.aggregate(params).toArray(); 
       }  
    }
    catch (e) {
      console.log(e); 
    }
    finally {
      client.close();
    }   
    return cursor  
}

module.exports = query;