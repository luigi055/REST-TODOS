const express = require('express');
const bodyParser = require('body-parser');
const {
  ObjectID
} = require('mongodb');

const mongoose = require('./db/mongoose');
const Todo = require('./models/todo');
const User = require('./models/user');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  console.log(req.body);
  var todo = new Todo({
    text: req.body.text,
  });

  todo.save().then(doc => {
    res.send(doc);
  }, err => {
    res
      .status(400)
      .send(err);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then(todos => {
    res.send({
      todos,
    });
  }, err => {
    res.status(400).send(err);
  });
});

app.get('/todos/:id', (req, res) => {
  const {
    id
  } = req.params;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({
      error: 'Invalid ID',
    });
  }
  Todo.findById(id).then(todo => {
    if (!todo) {
      res.status(404).send({
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
})

app.listen(PORT, () => {
  console.log(`successfully connected on port ${PORT}`);
});

module.exports = {
  app
};