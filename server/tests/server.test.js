const expect = require('chai').expect;
const request = require('supertest');
const {
  app
} = require('./../server');
const Todo = require('./../models/todo');

beforeEach(done => {
  // This removes all the document todos in the collection 
  // before each describe case
  Todo.remove({}).then(() => done());
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
        Todo.find().then(todos => {
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
          expect(todos.length).to.be.equal(0);
          done();
        }).catch(err => done(err));
      });
  });
});