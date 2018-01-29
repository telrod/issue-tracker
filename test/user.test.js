
import 'babel-polyfill';
import app from '../src/main';
import User from '../src/models/user';
import config from "../src/config";

const request = require('supertest')(app);
const expect = require('chai').expect;

describe('Users', () => {
  beforeEach((done) => { //Before each test we empty the database
    User.remove({}, (err) => {
      done();
    });
  });

  describe('/GET user', async () => {
    it('should return empty user array when success', (done) => {
      request.get('/user')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body).to.be.a('object');
          let userArray = res.body.users;
          expect(userArray).to.be.a('array').that.is.empty;
          done();
        });
    });
  });

  describe('/GET user', async () => {
    it('should return non-empty users array when success', (done) => {
      let user = new User({
        username: "Test",
        password: "foo",
        role: "user",
        token: "bar"
      });
      user.save((error, newIssue) => {
        request.get('/user')
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.a('object');
            let userArray = res.body.users;
            expect(userArray).to.be.a('array').that.is.not.empty;
            done();
          });
      });
    });
  });

  describe('/POST user', async () => {
    it('should create a new user when success', (done) => {
      let user = {
        username: "Test",
        password: "foo",
      };
      request.post('/user/create')
        .send(user)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(201);
          expect(res.body.username).to.equal(user.username);
          expect(res.body).to.have.property("role");
          expect(res.body).to.have.property("token");
          expect(res.body).to.have.property("id");
          done();
        });
    });
  });

  describe('/POST user/login', async () => {
    it('should create a new user and login when success', (done) => {
      let user = {
        username: "Test",
        password: "foo",
      };
      request.post('/user/create')
        .send(user)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(201);
          expect(res.body.username).to.equal(user.username);
          request.post('/user/login')
            .send(user)
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).to.equal(200);
              expect(res.body.username).to.equal(user.username);
              expect(res.body).to.have.property("role");
              expect(res.body).to.have.property("token");
              expect(res.body).to.have.property("id");
              done();
            });
        });
    });
  });

  

});


