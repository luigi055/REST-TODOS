const expect = require('chai').expect;
const request = require('supertest');
const {
  app
} = require('./../server');
const Todo = require('./../models/todo');

// Dummy todos (SEED DATA)
const todos = [{
  text: 'First test todo',
}, {
  text: 'Second test todo',
}]

beforeEach(done => {
  // This removes all the document todos in the collection 
  // before each 'it' case
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe('POST / todos', () => {
  it('should create a new todo', done => {
    const text = 'Test todo text';
    request(app)
      .post('/todos')
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
      .expect(200)
      .expect(res => {
        expect(res.body.todos).to.have.lengthOf(2);
      })
      .end((err, res) => {
        if (err) return done(err);

        Todo.find().then(todos => {
          expect(todos).to.be.an('array').that.have.lengthOf(2);
          done();
        }).catch(err => done(err));
      });
  });
});