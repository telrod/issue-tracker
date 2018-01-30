import 'babel-polyfill';
import app from '../src/main';
const request = require('supertest')(app);
const expect = require('chai').expect;

describe('test routes/index.js', async () => {
  it('should return Welcome to Issue Tracker. when success', (done) => {
    request.get('/')
    .expect(200)
    .end((err, res) => {
      if (err) return done(err);
      expect(res.body.msg).to.equal('Welcome to Issue Tracker.');
      done();
    });
  });
  it('should return swagger json when success', (done) => {
    request.get('/swagger.json')
    .expect(200)
    .end((err, res) => {
      if (err) return done(err);
      done();
    });
  });
});
