
import 'babel-polyfill';
import app from '../src/main';
import Issue from '../src/models/issue';

const request = require('supertest')(app);
const expect = require('chai').expect;

describe('Issues', () => {
  beforeEach((done) => { //Before each test we empty the database
    Issue.remove({}, (err) => {
      done();
    });
  });

  describe('/GET issue', async () => {
    it('should return empty issues array when success', (done) => {
      request.get('/issue')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body).to.be.a('object');
          let issueArray = res.body.issues;
          expect(issueArray).to.be.a('array').that.is.empty;
          done();
        });
    });
  });

  describe('/GET issue', async () => {
    it('should return non-empty issues array when success', (done) => {
      let issue = new Issue({
        title: "Test",
        priority: "Major",
        status: "TODO",
        description: "This is a test"
      });
      issue.save((error, newIssue) => {
        request.get('/issue')
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.a('object');
            let issueArray = res.body.issues;
            expect(issueArray).to.be.a('array').that.is.not.empty;
            done();
          });
      });
    });
  });

  describe('/GET issue', async () => {
    it('should return filter issues array when success', (done) => {
      let issue = new Issue({
        title: "Test",
        priority: "Major",
        status: "TODO",
        description: "This is a test"
      });
      let issue2 = new Issue({
        title: "Test",
        priority: "Minor",
        status: "TODO",
        description: "This is a test"
      });
      issue.save((error, newIssue) => {
        issue2.save((error, newIssue) => {
          request.get('/issue?priority=Major')
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).to.equal(200);
              expect(res.body).to.be.a('object');
              let issueArray = res.body.issues;
              expect(issueArray).to.be.a('array').that.is.not.empty;
              expect(issueArray).to.have.lengthOf(1);
              request.get('/issue?status=TODO')
                .end((err, res) => {
                  if (err) return done(err);
                  expect(res.status).to.equal(200);
                  expect(res.body).to.be.a('object');
                  let issueArray = res.body.issues;
                  expect(issueArray).to.be.a('array').that.is.not.empty;
                  expect(issueArray).to.have.lengthOf(2);
                  request.get('/issue?status=TODO&priority=Major')
                    .end((err, res) => {
                      if (err) return done(err);
                      expect(res.status).to.equal(200);
                      expect(res.body).to.be.a('object');
                      let issueArray = res.body.issues;
                      expect(issueArray).to.be.a('array').that.is.not.empty;
                      expect(issueArray).to.have.lengthOf(1);
                      done();
                    });
                });
            });
        });
      });
    });
  });

  describe('/POST issue', async () => {
    it('should fail to create a new issue with no title', (done) => {
      let issue = {
        priority: 1,
        status: 1,
        description: "This is a test"
      };
      request.post('/issue')
        .send(issue)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property("msg");
          done();
        });
    });
    it('should create a new issue when success', (done) => {
      let issue = {
        title: "Test",
        priority: "Major",
        status: "TODO",
        description: "This is a test"
      };
      request.post('/issue')
        .send(issue)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(201);
          expect(res.body.title).to.equal(issue.title);
          expect(res.body.priority).to.equal(issue.priority);
          expect(res.body.status).to.equal(issue.status);
          expect(res.body.description).to.equal(issue.description);
          expect(res.body).to.have.property("createdAt");
          expect(res.body).to.have.property("updatedAt");
          expect(res.body).to.have.property("id");
          done();
        });
    });
  });

  describe('/GET:id issue', async () => {
    it('should return error when id does not valid', (done) => {
        request.get('/issue/foo')
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("msg");
            done();
          });
    });
    it('should return not found when id does not exist', (done) => {
        request.get('/issue/5a6902152c666e77a4452044')
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property("msg");
            done();
          });
    });
    it('should return issue by id when success', (done) => {
      let issue = new Issue ({
        title: "Test",
        priority: "Major",
        status: "TODO",
        description: "This is a test"
      });
      issue.save((error, newIssue) => {
        request.get('/issue/' + newIssue.id)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body.title).to.equal(issue.title);
            expect(res.body.priority).to.equal(issue.priority);
            expect(res.body.status).to.equal(issue.status);
            expect(res.body.description).to.equal(issue.description);
            expect(res.body).to.have.property("createdAt");
            expect(res.body).to.have.property("updatedAt");
            expect(res.body).to.have.property("id");
            done();
          });
      });
    });
  });

  describe('/PATCH:id issue', async () => {
    it('should update only attributes passed for issue', (done) => {
      let issue = new Issue ({
        title: "Test",
        priority: "Major",
        status: "TODO",
        description: "This is a test"
      });
      issue.save((error, newIssue) => {
        let changedIssue = {
          title: "Updated Test",
          priority: "Minor"
        };
        request.patch('/issue/' + newIssue.id)
          .send(changedIssue)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body.title).to.equal(changedIssue.title);
            expect(res.body.priority).to.equal(changedIssue.priority);
            expect(res.body.status).to.equal(issue.status);
            expect(res.body.description).to.equal(issue.description);
            expect(res.body).to.have.property("createdAt");
            expect(res.body).to.have.property("updatedAt");
            expect(res.body).to.have.property("id");
            done();
          });
      });
    });
  });

  describe('/PUT:id issue', async () => {
    it('should update all attributes on existing issue', (done) => {
      let issue = new Issue ({
        title: "Test",
        priority: "Major",
        status: "TODO",
        description: "This is a test"
      });
      issue.save((error, newIssue) => {
        let changedIssue = {
          title: "Updated Test",
          priority: "Minor",
          status: "IN PROGRESS"
        };
        request.put('/issue/' + newIssue.id)
          .send(changedIssue)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body.title).to.equal(changedIssue.title);
            expect(res.body.priority).to.equal(changedIssue.priority);
            expect(res.body.status).to.equal(changedIssue.status);
            expect(res.body.description).to.not.equal(issue.description);
            expect(res.body).to.have.property("createdAt");
            expect(res.body).to.have.property("updatedAt");
            expect(res.body).to.have.property("id");
            done();
          });
      });
    });
  });

  describe('/DELETE:id issue', async () => {
    it('should return error when delete by id that is invalid', (done) => {
      request.delete('/issue/foo')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(400);
          done();
        });
    });
    it('should indicate not found when delete by id does not exist', (done) => {
      request.delete('/issue/5a6902152c666e77a4452044')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(404);
          expect(res.body).to.have.property("msg");
          done();
        });
    });
    it('should delete issue by id when success', (done) => {
      let issue = new Issue ({
        title: "Test",
        priority: "Major",
        status: "TODO",
        description: "This is a test"
      });
      issue.save((error, newIssue) => {
        request.delete('/issue/' + newIssue.id)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(204);
            done();
          });
      });
    });
  });



});


