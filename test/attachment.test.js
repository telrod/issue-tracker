import 'babel-polyfill';
import app from '../src/main';
import Issue from '../src/models/issue';
import Document from '../src/models/document';

const request = require('supertest')(app);
const expect = require('chai').expect;

describe('Attachments', () => {
  beforeEach((done) => { //Before each test we empty the database
    Document.remove({}, (err) => {
      Issue.remove({}, (err) => {
        done();
      });
    });
  });
});

describe('/POST attachment', async () => {
  it('should create a new image attachment for issue when success', (done) => {
    let issue = new Issue({
      title: "Test Attachment",
      priority: 1,
      status: 1,
      description: "This is a test"
    });
    issue.save((error, newIssue) => {
      const fileName = 'apple.png';
      const issueId = newIssue.id;
      request.post('/issue/' + issueId + '/attachment')
        .attach('attachment', 'test/files/' + fileName)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(201);
          expect(res.body.name).to.equal(fileName);
          expect(res.body.mimetype).to.equal("image/png");
          expect(res.body).to.have.property("createdAt");
          expect(res.body).to.have.property("updatedAt");
          expect(res.body).to.have.property("id");
          // check that issue now contains attachment id
          const attachmentId = res.body.id;
          Issue.findById({_id: issueId}, (err, updatedIssue) => {
            expect(updatedIssue).to.have.property("attachments");
            let attachments = updatedIssue.attachments;
            expect(attachments).to.include(attachmentId);
            done();
          });
        })
    });
  });
});

describe('/GET attachment', async () => {
  it('should stream image attachment for issue when success', (done) => {
    let issue = new Issue({
      title: "Test Attachment",
      priority: 1,
      status: 1,
      description: "This is a test"
    });
    issue.save((error, newIssue) => {
      const fileName = 'apple.png';
      const issueId = newIssue.id;
      request.post('/issue/' + issueId + '/attachment')
        .attach('attachment', 'test/files/' + fileName)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(201);
          const attachmentId = res.body.id;
          request.get('/issue/' + issueId + '/attachment/' + attachmentId)
            .expect('Content-Type', 'image/png')
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).to.equal(200);
              done();
            });
        })
    });
  });
});

describe('/DELETE attachment', async () => {
  it('should delete image attachment for issue when success', (done) => {
    let issue = new Issue({
      title: "Test Attachment",
      priority: 1,
      status: 1,
      description: "This is a test"
    });
    issue.save((error, newIssue) => {
      const fileName = 'apple.png';
      const issueId = newIssue.id;
      request.post('/issue/' + issueId + '/attachment')
        .attach('attachment', 'test/files/' + fileName)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(201);
          const attachmentId = res.body.id;
          request.delete('/issue/' + issueId + '/attachment/' + attachmentId)
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).to.equal(204);
              // now verify document deleted
              Document.findById({_id: attachmentId}, (err, deletedAttachment) => {
                expect(deletedAttachment).to.be.null;
                Issue.findById({_id: issueId}, (err, updatedIssue) => {
                  expect(updatedIssue).to.have.property("attachments");
                  let attachments = updatedIssue.attachments;
                  expect(attachments).to.not.include(attachmentId);
                  done();
                });
              });
            });
        })
    });
  });
});
