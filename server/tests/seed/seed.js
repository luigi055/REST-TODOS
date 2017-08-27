const {
  ObjectID
} = require('mongodb');
const Todo = require('./../../models/todo');
const User = require('./../../models/user');
const jwt = require('jsonwebtoken');

// Dummy users (SEED DATA)
const userOneId = new ObjectID();
const userTwoId = new ObjectID();

// Dummy todos (SEED DATA)
const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: userOneId,
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoId,
}];

const populateTodos = done => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};

const users = [{
  _id: userOneId,
  email: 'test1@email.com',
  password: '123abc!',
  tokens: [{
    access: 'auth',
    token: jwt.sign({
      _id: userOneId,
      access: 'auth',
    }, process.env.JWT_SECRET).toString(),
  }]
}, {
  _id: userTwoId,
  email: 'test2@email.com',
  password: '123456',
  tokens: [{
    access: 'auth',
    token: jwt.sign({
      _id: userTwoId,
      access: 'auth',
    }, process.env.JWT_SECRET).toString(),
  }]
}];

const populateUsers = (done => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);

  }).then(() => done());
});


module.exports = {
  todos,
  users,
  populateTodos,
  populateUsers,
}