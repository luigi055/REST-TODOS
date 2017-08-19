// JWT JSON Web Token in theory

const {
  SHA256
} = require('crypto-js');

var message = 'i am user number 4';
var hash = SHA256(message).toString(); //since sha256 return an object
console.log(`Message ${message}`);
console.log(`Hash ${hash}`);

const data = {
  id: 4,
};

var token = {
  data,
  hash: SHA256(JSON.stringify(data, null, 2) + 'somesecretsalt').toString(),
}

// Changing the value of data manually from client
// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();

const resultHash = SHA256(JSON.stringify(data, null, 2) + 'somesecretsalt').toString();
if (resultHash === token.hash) {
  console.log('Data was not changed');
} else {
  console.log('Data was changed, do not trust!');
}