const {
  ObjectID
} = require('mongodb');
const mongoose = require('./../server/db/mongoose');
const Todo = require('./../server/models/todo');
const User = require('./../server/models/user');

// var id = '598f67f1de560a4908e57af4';

// if (!ObjectID.isValid(id)) {
//   console.log('ID not valid');
// }

// looking a document using id

// Todo.find({
//   _id: id,
// }).then(todos => {
//   console.log('Todos', todos);
// });

// Todo.findOne({ // find just one result. this is preferible over find()
//   _id: id,
// }).then(todo => {
//   console.log('Todos', todo);
// });


// Todo.findById(id).then(todo => {
//   if (!todo) {
//     return console.log('ID not Found');
//   }
//   console.log('Todo by id', todo);
// }).catch(e => console.log(e));

var userId = '598e726c8658e72758b63742';

User.findById(userId).then(user => {
  if (!user) return console.log('Unable to find user');
  console.log('user', user);
}).catch(e => console.log(e));