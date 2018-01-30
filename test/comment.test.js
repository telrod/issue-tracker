import 'babel-polyfill';
import app from '../src/main';
import Issue from '../src/models/issue';

const request = require('supertest')(app);
const expect = require('chai').expect;

describe('Comments', () => {
  beforeEach((done) => { //Before each test we empty the database
      Issue.remove({}, (err) => {
        done();
      });
  });
});

describe('/POST comment', async () => {
  it('should create a new comment for issue when success', (done) => {
    let issue = new Issue({
      title: "Test Attachment",
      priority: "Major",
      status: "TODO",
      description: "This is a test"
    });
    issue.save((error, newIssue) => {
      let comment = {
        message: 'This is a test comment'
      };
      const issueId = newIssue.id;
      request.post('/issue/' + issueId + '/comment')
        .send(comment)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(201);
          expect(res.body.message).to.equal(comment.message);
          expect(res.body).to.have.property("createdAt");
          // check that issue now contains comment
          Issue.findById({_id: issueId}, (err, updatedIssue) => {
            expect(updatedIssue).to.have.property("comments");
            let comments = updatedIssue.comments;
            console.log("comments: " + comments);
            expect(comments).to.be.a('array').that.is.not.empty;
            done();
          });
        })
    });
  });
});

describe('/GET comments', async () => {
  it('should get comments for issue when success', (done) => {
    let issue = new Issue({
      title: "Test Attachment",
      priority: "Major",
      status: "TODO",
      description: "This is a test"
    });
    issue.save((error, newIssue) => {
      let comment = {
        message: 'This is a test comment'
      };
      const issueId = newIssue.id;
      request.post('/issue/' + issueId + '/comment')
        .send(comment)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(201);
          request.get('/issue/' + issueId + '/comment')
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).to.equal(200);
              expect(res.body).to.be.a('array').that.is.not.empty;
              done();
            });
    })
    });
  });
  it('should error with invalid issue id', (done) => {
    let comment = {
      message: 'This is a test comment'
    };
      request.post('/issue/foo/comment')
        .send(comment)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(400);
          request.get('/issue/foo/comment')
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).to.equal(400);
              done();
            });
        });
  });
});
