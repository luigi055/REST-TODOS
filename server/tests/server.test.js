const expect = require('chai').expect;
const request = require('supertest');
const bcrypt = require('bcryptjs');
const {
  ObjectID
} = require('mongodb');
const {
  app
} = require('./../server');
const Todo = require('./../models/todo');
const User = require('./../models/user');
const {
  todos,
  users,
  populateTodos,
  populateUsers,
} = require('./seed/seed');



beforeEach(populateUsers)
// beforeEach(done => {
//   // This removes all the document todos in the collection 
//   // before each 'it' case
//   populateTodos(done);

// });
// Or just
beforeEach(populateTodos);


describe('POST /todos', () => {
  it('should create a new todo', done => {
    const text = 'Test todo text';
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({
        text,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.text).to.be.equal(text);
      })
      .end((err, res) => {
        if (err) return done(err);

        // Fetch among all the todos if exist this one
        // In the mongodb
        Todo.find({
          text
        }).then(todos => {
          expect(todos.length).to.be.equal(1);
          expect(todos[0].text).to.be.equal(text);
          done();
        }).catch(err => done(err));
      });
  });

  it('should not creat todo with invalid body data', done => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        Todo.find().then(todos => {
          expect(todos.length).to.be.equal(2);
          done();
        }).catch(err => done(err));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos created', done => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        // just one todo created with this id
        expect(res.body.todos).to.have.lengthOf(1);
      })
      .end((err, res) => {
        if (err) return done(err);

        Todo.find({
          _creator: users[0]._id,
        }).then(todos => {
          expect(todos).to.be.an('array').that.have.lengthOf(1);
          done();
        }).catch(err => done(err));
      });
  });
});

describe('GET /todos/:todo', () => {
  it('should get todo document', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).to.be.equal(todos[0].text);
      })
      .end(done);
  })
  it('should get error if ID not found', done => {
    // create a new random id that cant be found
    const hexId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .expect(res => {
        expect(res.body.error).to.be.equal('Todo Not Found');
      })
      .end(done);

  });
  it('should get error if ID is invalid', done => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .expect(res => {
        expect(res.body.error).to.be.equal('Invalid ID');
      })
      .end(done);

  });

});

describe('DELETE /todos/:id', () => {
  it('should delete a todo by id', done => {
    const hexId = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text)
          .to.be.a('string')
          .that.is.equal(todos[1].text);
      })
      .end((err, res) => {
        if (err) return done(err);

        // find the todo removed that should be empty
        Todo.findById(hexId).then(todo => {
          expect(todo).to.be.null;
          done();
        }).catch(err => done(err));
      });
  });

  it('should return 404 if todo not found', done => {
    const id = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);
  })

  it('should return 404 if todo id is invalid format', done => {
    request(app)
      .delete('/todos/123abc')
      .expect(404)
      .expect(res => {
        expect(res.body.error).to.be.equal('Invalid ID');
      })
      .end(done);
  })
});

describe('PATCH /todos/:id', () => {
  it('should update the first todo and toggle to true', done => {
    const hexId = todos[0]._id.toHexString();
    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        text: 'update from mocha test',
        completed: true,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).is.equal(hexId);
        expect(res.body.todo.text).is.a('string').that.is.equal('update from mocha test');
        expect(res.body.todo.completedAt).is.a('number');
        expect(res.body.todo.completed).is.true;
      })
      .end(done)
  });

  it('should update the second todo and toggle it to false', done => {
    const hexId = todos[1]._id.toHexString();
    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        text: 'Be confident on doing TDD',
        completed: false,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).is.a('string').that.is.equal('Be confident on doing TDD');
        expect(res.body.todo.completedAt).to.be.null;
        expect(res.body.todo.completed).is.false;
      })
      .end(done)
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token) // Set header
      .expect(200)
      .expect(res => {
        expect(res.body._id).to.be.equal(users[0]._id.toHexString());
        expect(res.body.email).to.be.equal(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', done => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).to.be.empty;
      })
      .end(done);
  })
});

describe('POST /users', () => {
  it('should create a user', done => {
    const email = 'test1@gmail.com';
    const password = '123abc!';
    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).to.exist;
        expect(res.body._id).to.be.a('string').that.exist;
        expect(res.body.email).to.be.equal(email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findOne({
          email,
        }).then(user => {
          expect(user).to.exist;
          expect(user.password).to.not.equal(password);
          bcrypt.compare(password, user.password, (err, userPw) => {
            expect(userPw).to.be.a('boolean').that.is.true;
            done();
          });
        }).catch(err => done(err));
      })
  });

  it('should return validation errors if request invalid', done => {
    const email = 'test1';
    const password = '123a';
    request(app)
      .post('/users')
      .send({
        email,
        password,
      })
      .expect(400)
      .end(done);
  });

  it('it should not create user if email in use', done => {

    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: users[0].password,
      })
      .expect(400)
      .end(done);
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', done => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.header['x-auth']).to.not.exist;
      })
      .end((err, res) => {
        if (err) return done(err);
        User.findById(users[0]._id).then(user => {
          expect(user.tokens).to.be.an('array').that.is.empty;
          done();
        }).catch(err => done(err));
      });
  });

  it('should throw 401 error if not x-auth', done => {
    request(app)
      .delete('/users/me/token')
      .expect(401)
      .end(done);
  });
});