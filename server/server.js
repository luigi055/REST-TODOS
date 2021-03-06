require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {
  ObjectID
} = require('mongodb');
const bcrypt = require('bcryptjs');

const mongoose = require('./db/mongoose');
const Todo = require('./models/todo');
const User = require('./models/user');
const authenticate = require('./middleware/authenticate');


const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id,
  });

  todo.save().then(doc => {
    res.send(doc);
  }, err => {
    res
      .status(400)
      .send(err);
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id // just return all the todos made by this user
  }).then(todos => {
    res.send({
      todos,
    });
  }, err => {
    res.status(400).send(err);
  });
});

app.get('/todos/:id', authenticate, (req, res) => {
  const {
    id
  } = req.params;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({
      error: 'Invalid ID',
    });
  }
  Todo.findOne({
    _id: id,
    _creator: req.user._id,
  }).then(todo => {
    if (!todo) {
      return res.status(404).send({
        error: 'Todo Not Found'
      });
    };

    res.send({
      todo
    });

  }).catch(err => {
    res.status(400).send({
      error: 'incorrect ID format'
    });
  })
});

app.delete('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({
      error: 'Invalid ID'
    });
  }
  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id,
  }).then(todo => {

    if (!todo) {
      return res.status(404).send({
        error: 'Todo Not Found',
      })
    }

    res.send({
      todo
    });

  }).catch(err => {
    return res.status(400).send({
      error: 'incorrect ID Format',
    })
  });
});

app.patch('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;
  // const body = _.pick(req.body, ['text', 'completed']);
  const {
    body
  } = req;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({
      error: 'Invalid ID',
    });
  }

  // if (_.isBoolean(body.completed && body.completed)) {
  //   body.completedAt = new Date().getTime();
  // } else {

  // }

  if (typeof body.completed === 'boolean' && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  }, {
    $set: body
  }, {
    new: true
  }).then(todo => {
    if (!todo) {
      return res.status(404).send({
        error: 'Todo Not Found',
      });
    }

    res.send({
      todo
    });

  }).catch(err => res.status(400).send());

});

// =========================================
// /////////////USERS ROUTES////////////////
// =========================================

app.post('/users', (req, res) => {
  const {
    body,
  } = req;

  const user = new User(body);
  user.save().then(() => {

    // res.send(user); 
    // Instead of just show the user with express
    // we're going to process the email and password
    // and auto generate a hashed token using the function that
    // Was created in the User Schema
    return user.generateAuthToken();
    // This return the token value that we're going to 
    // use in the next then chain
  }).then((token) => {
    // we're going to pass a variable in the header (a custom header) of the server
    res.header('x-auth', token).send(user); // now here we send the user
  }).catch(err => {
    res.status(400).send(err);
  });
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  const {
    email,
    password
  } = req.body;

  User.findByCredentials(email, password).then(user => {
    return user.generateAuthToken().then(token => {
      res.header('x-auth', token).send(user);
    });
  }).catch(err => res.status(400).send());
});


app.delete('/users/me/token', authenticate, (req, res) => {
  //console.log(req.user); // comes from authenticate middleware
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen(PORT, () => {
  console.log(`successfully connected on port ${PORT}`);
});

module.exports = {
  app
};