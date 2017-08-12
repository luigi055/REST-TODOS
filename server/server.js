const express = require('express');
const bodyParser = require('body-parser');
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

app.listen(PORT, () => {
  console.log(`successfully connected on port ${PORT}`);
});