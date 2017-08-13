const {
  ObjectID
} = require('mongodb');
const mongoose = require('./../server/db/mongoose');
const Todo = require('./../server/models/todo');
const User = require('./../server/models/user');

// Todo.remove()
// if you want to remove everything in your collection use
// Todo.remove({});

// Todo.remove({}).then(res => {
//   console.log(JSON.stringify(res, null, 2));
// }).catch(err => console.log(err));

// Todo.findOneAndRemove({
//   _id: '599089eb7166c50f34576ab7',
// }).then(res => {
//   console.log(JSON.stringify(res, null, 2));
// }, err => {
//   console.log('! -ERROR- !', err);
// });

Todo.findByIdAndRemove('599089ee71668').then(todo => {
  if (!todo) return console.log('Id NOT FOUND');
  console.log(JSON.stringify(todo, null, 2));
}).catch(err => {
  console.log('ID NOT VALID')
  // console.log('! -ERROR- !', err);
});