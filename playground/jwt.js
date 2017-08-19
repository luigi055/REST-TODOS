// Same example in hashing.js but with less code
// and easier using json web tokens

const jwt = require('jsonwebtoken');

// Two methods we're going to use.
// jsw.sign
// jwt.verify

const data = {
  id: 4,
}
// two parameters 1: the data to hash 2: the salt string
const token = jwt.sign(data, '123abc');
console.log('hashed token:', token);

// two parameters 1: the data to verify 2: the salting using when tokenizing
var decoded = jwt.verify(token, '123abc');
console.log('decoded token:', decoded);