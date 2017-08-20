const bcrypt = require('bcryptjs');

const password = '123abc!';

// two methods
// saltint password
// two arguments 1: number of rounds
// bcrypt.genSalt(10, (err, salt) => {
//   // hasing password
//   bcrypt.hash(password, salt, (err, hash) => {
//     console.log('Hash:', hash); // get our hashedPassword
//   });
// });

// decode hashed password
const hashedPassword = '$2a$10$pzqmKrM5acO/6MsvdnB4M.NLeqPKdp1z7SRl2M5eIAoyYNBxLYbei';

bcrypt.compare(password, hashedPassword, (err, res) => {
  console.log(res); // should be true
});