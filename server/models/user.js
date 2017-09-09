const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  isEmail
} = require('validator');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    // validate: { // You could use this method of validation
    //   validator(value) {
    //     // expect to return a boolean
    //       return isEmail(value);
    //     }
    //   },
    validate: isEmail,
    message: '{VALUE} is not a valid email',
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
  },
  tokens: [{
    access: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  }],
});

// This is the mongoose inner method that transform any of our 
// Object we sent with express before get saved to mongodb 
UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  const {
    _id,
    email
  } = userObject;
  // we need to hide tokens and password before send our
  // Respond with express
  return {
    _id,
    email,
  };
}

UserSchema.methods.generateAuthToken = function () {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({
    _id: user._id.toHexString(),
    access,
  }, process.env.JWT_SECRET).toString();

  // we push this property inside the tokens array to each new user document
  user.tokens.push({
    access,
    token,
  });

  return user.save().then(() => {
    return token;
  });
}

UserSchema.methods.removeToken = function (token) {
  const user = this;
  // $pull remove propeties from arrays
  return user.update({
    $pull: {
      tokens: {
        token, // removed all tokens if  parameter is passed in empty
      }
    }
  });

}

// Creating a static to get token before get any todo
UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Reject the promise
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
    // or better like this (the same thing)
    return Promise.reject();
  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth',
  });
}

UserSchema.statics.findByCredentials = function (email, password) {
  const User = this;

  // chaining the promise
  return User.findOne({
    email
  }).then(user => {
    if (!user) {
      return Promise.reject(); // activate .catch()
    }

    // since bcrypt only support callback functions and we want to use promises
    // we're going to wrap that bcrypt with a new promise 
    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to comprare password with user-password
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject(err);
        }
      });
    });
  });
}


// Before the document will save we'll use a middleware
// user model

UserSchema.pre('save', function (next) {
  const user = this;
  // check if the password was modified
  // will use a built in method from pre
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      // Hashing password
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (bcrypt.compare(user.password, hash)) {
          user.password = hash;
          next();
        }
      });
    });
  } else {
    // if not modified go next 
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;