// const MongoClient = require('mongodb').MongoClient;
const {
  ObjectID,
  MongoClient
} = require('mongodb');

// var obj = new ObjectID();

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB Server');
  }

  console.log('Connected to MongoDB Server');
  // db.collection('Todos').insertOne({
  //   text: 'Something to do',
  //   completed: false,
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to insert Todo', err);
  //   }
  //   console.log(JSON.stringify(result.ops, null, 2));
  // });

  db.collection('User').insertOne({
    name: 'Luigi',
    age: 26,
    location: 'San Carlos, Cojedes - Venezuela',
  }, (err, res) => {
    if (err) {
      return console.log('Unable to insert User', err);
    }
    console.log(JSON.stringify(res.ops, null, 2));
  });
  db.close();
});