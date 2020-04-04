const express = require('express');
const router = express.Router();
const query = require('./helpers/query');
const cache = require('./helpers/cache').check;
const templates = require('./helpers/templating');
const invokeClient = require('./helpers/client'); // keep conection alive for routes with several queries

// URI
const m_uri = 'mongodb+srv://monster_user:1234@cluster0-luguo.gcp.mongodb.net/monsterPage?ssl=true&authSource=admin&w=majority';
const f_uri = 'mongodb+srv://monster_forum:1234@cluster0-luguo.gcp.mongodb.net/monsterPage?ssl=true&authSource=admin&w=majority';

// GET Monsters Page, fill list from server */
router.get('/list', async function(req, res) {
  const args = [m_uri,'monsters','find','{}'];
  const cursor = await cache('list',query,args);
  res.render('monsters', { list: cursor }); 
});

/* GET Individual entry. */
router.get('/entry', async function(req, res) {
  let id = req.query.valor;
  // find monster entry
  let args = [m_uri,'monsters','find','{}'];
  const list = await cache('list',query,args)
  let document;
  for (doc of list) { if (doc._id == id) { document = doc; break } }
  res.render('entry',{ entry: document });
});

/* GET forum activity for individual entry */
router.get('/pushComments', async function (req,res) {
  let id = req.query.valor;
  const foro = await query(f_uri,'forum','find',{ "_id": parseInt(id)});
  let html = templates.comments({ forum: foro[0] });
  res.send(html);
});

/* POST new comment */
router.post('/newComment', async function (req,res) {
  const client = await invokeClient(f_uri); // keep conection open since route implies several queries 
  const collection = client.db('monsterPage').collection('forum');  
    try {
      const forumID = req.query.valor;
      const stages = [{ $match: { "_id": parseInt(forumID)} },{ $project: {"_id": 0, "comments": 1}},{ $unwind: "$comments" },{ $group : { _id: null, max: { $max : "$comments._id" }}}];
      const last = await collection.aggregate(stages).toArray();
      let newID; if (last.length > 0) { newID = last[0].max + 1 } else { newID = 1 }
      const comment = { 
        "_id": newID,
        "user_id": req.session.userID,
        "user_name": req.session.name, 
        "created": new Date(),
        "last_edited": new Date(),
        "subject": req.body['comment-subject'],
        "paragraph": req.body['comment-content'],
        "likes": 0,
        "replies": []
        };
      let args = { "filter": { "_id": parseInt(forumID) }, "update": { $push: { "comments": comment } } };
      let update = await collection.updateOne(args.filter,args.update)
      if (update.modifiedCount == 1) {
        const foro = await collection.find({ "_id": parseInt(forumID)}).toArray();
        let html = templates.comments({ forum: foro[0] });
        res.json({content: html, user: req.session.userID}); 
      }
      else {
        res.json({ error: 'Update Fallo'});
      }
    }
  finally { client.close() }
})

/* POST new reply */
router.post('/newReply', async function (req,res) { 
  const client = await invokeClient(f_uri); // keep conection open since route implies several queries 
  const collection = client.db('monsterPage').collection('forum');  
    try { 
      const forumID = req.query.valor;
      const commentID = req.query.comment;
      const stages = [{ $match: { "_id": parseInt(forumID)} },{ $project: {"_id": 0, "comments": 1}},{ $unwind: "$comments" },{ $match: { "comments._id": parseInt(commentID) }},{ $project: { "replies": "$comments.replies"} },{ $unwind: "$replies" },{ $group : { _id: null, max: { $max : "$replies._id" }}}];
      const last = await collection.aggregate(stages).toArray();
      let newID; if (last.length > 0) { newID = last[0].max + 1 } else { newID = 1 }
      const reply = { 
        "_id": newID,
        "user_id": req.session.userID,
        "user_name": req.session.name, 
        "created": new Date(),
        "last_edited": new Date(),
        "paragraph": req.body['reply-content'],
        "likes": 0
        };
      let args = { "filter": { "_id": parseInt(forumID), "comments._id": parseInt(commentID) }, "update": { $push: { "comments.$.replies": reply } } };
      let update = await collection.updateOne(args.filter,args.update);
      if (update.modifiedCount == 1) {
        const aggr = [{ $match: { "_id": parseInt(forumID)} },{ $project: {"_id": 0, "comments": 1}},{ $unwind: "$comments" },{ $match: { "comments._id": parseInt(commentID) }},{ $project: { "replies": "$comments.replies"} }];
        const replies = await collection.aggregate(aggr).toArray();
        let html = templates.replies({ reply: replies[0] });
        res.json({content: html, user: req.session.userID}); 
      }
      else {
        res.json({ error: 'Update Fallo'});
      }
    }
    catch (e) { console.log(e) }
    finally { client.close() }
})

/* POST edit comment */
router.post('/editComment', async function (req,res) {
  const client = await invokeClient(f_uri); // keep conection open since route implies several queries 
  const collection = client.db('monsterPage').collection('forum');  
    try {
      const userID = req.session.userID;
      const forumID = req.query.valor;
      const innerID = req.query.innerID;
      const subject = req.body['edit-comment-subject'];
      const paragraph = req.body['edit-comment-content'];
      let args = { 
        "filter": { "_id": parseInt(forumID) }, 
        "update": { $set: { 
          "comments.$[elem].last_edited": new Date(),
          "comments.$[elem].subject": subject,
          "comments.$[elem].paragraph": paragraph
         } 
        },
        "arrayfilter": { arrayFilters: [ { "elem._id": parseInt(innerID), "elem.user_id": userID } ] }
      };
      let update = await collection.updateOne(args.filter,args.update,args.arrayfilter);
      console.log(update)
      if (update.modifiedCount == 1) {
        const foro = await collection.find({ "_id": parseInt(forumID)}).toArray();
        let html = templates.comments({ forum: foro[0] });
        res.json({content: html, user: userID}); 
      }
      else {
        res.json({ error: 'Update Fallo'});
      }
    }
  finally { client.close() }
})

/* POST edit reply */
router.post('/editReply', async function (req,res) {
  const client = await invokeClient(f_uri); // keep conection open since route implies several queries 
  const collection = client.db('monsterPage').collection('forum');  
    try {
      const userID = req.session.userID;
      const forumID = req.query.valor;
      const commentID = req.query.comment;
      const innerID = req.query.innerID;
      const paragraph = req.body['edit-reply-content'];
      let args = { 
        "filter": { "_id": parseInt(forumID) }, 
        "update": { $set: { 
          "comments.$[elem].replies.$[element].last_edited": new Date(),
          "comments.$[elem].replies.$[element].paragraph": paragraph
         } 
        },
        "arrayfilter": { arrayFilters: [ 
          { "elem._id": parseInt(commentID) },
          { "element._id": parseInt(innerID), "element.user_id": userID }
         ]}
      };
      let update = await collection.updateOne(args.filter,args.update,args.arrayfilter);
      if (update.modifiedCount == 1) {
        const aggr = [{ $match: { "_id": parseInt(forumID)} },{ $project: {"_id": 0, "comments": 1}},{ $unwind: "$comments" },{ $match: { "comments._id": parseInt(commentID) }},{ $project: { "replies": "$comments.replies"} }];
        const replies = await collection.aggregate(aggr).toArray();
        let html = templates.replies({ reply: replies[0] });
        res.json({content: html, user: userID});  
      }
      else {
        res.json({ error: 'Update Fallo'});
      }
    }
  finally { client.close() }
});

/* POST delete comment */
router.post('/deleteComment', async function (req,res) {
  const client = await invokeClient(f_uri); // keep conection open since route implies several queries 
  const collection = client.db('monsterPage').collection('forum');  
    try {
      const userID = req.session.userID;
      const forumID = req.query.valor;
      const commentID = req.query.comment;
      let args = { 
        "filter": { "_id": parseInt(forumID) }, 
        "update": { $pull: { 
          "comments": { 
            "_id": parseInt(commentID),
            "user_id": userID
          } } 
         } 
      };
      let update = await collection.updateOne(args.filter,args.update);
      if (update.modifiedCount == 1) {
        const foro = await collection.find({ "_id": parseInt(forumID)}).toArray();
        let html = templates.comments({ forum: foro[0] });
        res.json({content: html, user: userID}); 
      }
      else {
        res.json({ error: 'Update Fallo'});
      }
    }
  finally { client.close() }
})

/* POST delete reply */
router.post('/deleteReply', async function (req,res) {
  const client = await invokeClient(f_uri); // keep conection open since route implies several queries 
  const collection = client.db('monsterPage').collection('forum');  
    try {
      const userID = req.session.userID;
      const forumID = req.query.valor;
      const commentID = req.query.comment;
      const replyID = req.query.reply;
      let args = { 
        "filter": { "_id": parseInt(forumID) }, 
        "update": { $pull: { 
          "comments.$[elem].replies": { 
              "_id": parseInt(replyID),
              "user_id": userID
            }
          } 
         },
         "arrayfilter": { arrayFilters: [ { "elem._id": parseInt(commentID)} ] } 
       }; 
      let update = await collection.updateOne(args.filter,args.update,args.arrayfilter);
      if (update.modifiedCount == 1) {
        const aggr = [{ $match: { "_id": parseInt(forumID)} },{ $project: {"_id": 0, "comments": 1}},{ $unwind: "$comments" },{ $match: { "comments._id": parseInt(commentID) }},{ $project: { "replies": "$comments.replies"} }];
        const replies = await collection.aggregate(aggr).toArray();
        let html = templates.replies({ reply: replies[0] });
        res.json({content: html, user: userID});   
      }
      else {
        res.json({ error: 'Update Fallo'});
      }
    }
  finally { client.close() }
})

module.exports = router;