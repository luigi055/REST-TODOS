const env = process.env.NODE_ENV || 'development';
console.log('Env *****', env);

if (env === 'development' || env === 'test') {
  // When require JSON in nodejs it automatically parses to JavaScript Object
  const config = require('./config.json');
  var envConfig = config[env]; // Find the type of enviroment if development of test
  // Loop over all the properties of envConfig and set the new enviroment variables
  // Depending on the type of enviroment
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  }); // Get all the property names of the object
}

// if (env === 'development') {
//   process.env.PORT = 3000;
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
// } else if (env === 'test') {
//   process.env.PORT = 3000;
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
// }