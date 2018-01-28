import express from 'express';
import log from 'log';
import multer from 'multer';
import config from 'config';
import fs from 'fs';
import del from 'del';

import { Issue, Document } from 'models';

const router = new express.Router();
const upload = multer({dest: config.uploadPath});

router.get('/', async (req, res, next) => {
  try {
    const issues = await Issue.find();
    return res.send({issues});
  } catch (err) {
    log.error("Error geeting issues", err);
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    let issue = await Issue.findById(id).populate('attachments');
    if(issue) {
      return res.send(issue);
    } else {
      return res.status(404).json({msg:'Issue not found by id: ' + id})
    }
  } catch (err) {
    log.error("Error looking up issue with id: " + id, err);
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.is('application/json')) {
    return next(
      new Error("Expects Content-Type: 'application/json'")
    );
  }
  const data = req.body || {};
  try {
    log.debug('Issue post: ' + data);
    const issue = new Issue(data);
    let newIssue = await issue.save();
    // let newIssue = await Issue.create(payload);
    //TODO: fix so not hard coded domain and path
    log.debug('Created issue: ' + newIssue);
    res.set('Location', 'http://localhost:3000/issue/' + newIssue.id);
    return res.status(201).send(newIssue);
  } catch (err) {
    // if (err.name === 'MongoError' && err.code === 11000) {
    //   res.status(409).send(new MyError('Duplicate key', [err.message]));
    // }
    // res.status(500).send(err);
    log.error(err);
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  if (!req.is('application/json')) {
    return next(
      new Error("Expects Content-Type: 'application/json'")
    );
  }
  const id = req.params.id;
  const data = req.body || {};
  try {
    log.debug('Issue put: ' + data);
    let existingIssue = await Issue.findById({_id: id});

    if (!existingIssue) {
      return res.status(404).json({msg: 'Issue not found by id: ' + id});
    } else {
      existingIssue.title = data.title || null;
      existingIssue.priority = data.priority;
      existingIssue.status = data.status;
      existingIssue.description = data.description || "";
      existingIssue.comments = data.comments;
      let updatedIssue = await existingIssue.save();
      log.debug("Update issue: " + JSON.stringify(updatedIssue));
      res.status(200).send(updatedIssue);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  if (!req.is('application/json')) {
    return next(
      new Error("Expects Content-Type: 'application/json'")
    );
  }
  const id = req.params.id;
  const data = req.body || {};
  try {
    log.debug('Issue patch: ' + data);
    let updatedIssue = await Issue.findOneAndUpdate({_id: id}, data, {new: true});

    if (!updatedIssue) {
      return res.status(404).json({msg: 'Issue not found by id: ' + id});
    } else {
      log.debug("Update issue: " + JSON.stringify(updatedIssue));
      res.status(200).send(updatedIssue);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
});

router.delete('/:id', async(req, res, next) => {
  const id = req.params.id;
  try {
    log.info("delete id: " + id);
    let issue = await Issue.findOneAndRemove({_id:id});
    if(!issue) {
      return res.status(404).json({msg:'Issue not found by id: ' + id});
    } else {
      return res.status(204).json({msg: 'Issue successfully deleted.'});
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
});

router.post('/:id/attachment', upload.single('attachment'), async(req, res, next) => {
  const id = req.params.id;

  try {
    // first need to check that id is valid for an issue
    let existingIssue = await Issue.findById({_id: id});
    if (!existingIssue) {
      return res.status(404).json({msg: 'Issue not found by id: ' + id});
    } else {
      // next, create the attachment document
      let attachment = new Document({
        name: req.file.originalname,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.filename,
        path: req.file.path
      });
      let newAttachment = await attachment.save();

      // now update the issue to include new document
      existingIssue.attachments.push(newAttachment);
      await existingIssue.save();

      log.debug('Created attachment: ' + newAttachment);
      res.set('Location', 'http://localhost:3000/issue/' + existingIssue.id + '/attachment/' + newAttachment.id);
      return res.status(201).send(newAttachment);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }

});

router.get('/:id/attachment/:attachmentId', async(req, res, next) => {
  const id = req.params.id;
  const attachmentId = req.params.attachmentId;
  log.debug("getting document where issue id: " + id + " and attachment id " + attachmentId);

  try {
    // first, make sure the issue exists that contains the attachment
    let existingIssue = await Issue.findOne({_id: id, attachments: [attachmentId]});
    log.debug("existingIssue: " + existingIssue);
    if (!existingIssue) {
      return res.status(404).json({msg: 'Attachment not found.'});
    } else {
        const document = await Document.findById(attachmentId);
        if(document) {
          res.setHeader('Content-Type', document.mimetype);
          fs.createReadStream(document.path).pipe(res);
        } else {
          return res.status(404).json({msg: 'Attachment not found by id: ' + attachmentId});
        }
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
});

router.delete('/:id/attachment/:attachmentId', async(req, res, next) => {
  const id = req.params.id;
  const attachmentId = req.params.attachmentId;

  try {
    // first, make sure the issue exists that contains the attachment
    let existingIssue = await Issue.findOne({_id: id, attachments: [attachmentId]});
    log.debug("existingIssue: " + existingIssue);
    if (!existingIssue) {
      return res.status(404).json({msg: 'Attachment not found.'});
    } else {
      // remove attachment from issue array
      existingIssue.attachments = existingIssue.attachments.filter(item => item != attachmentId);
      log.debug("existingIssue: " + existingIssue);
      await existingIssue.save();

      // remove document from mongo
      const deletedDocument = await Document.findByIdAndRemove(attachmentId);
      log.debug("deleted document: " + deletedDocument);
      // remove document from filesystem
      if(deletedDocument) {
        del.sync([deletedDocument.path]);
      }

      return res.status(204).json({msg: 'Attachment successfully deleted.'});
    }
  } catch (err) {
    log.error(err);
    next(err);
  }

});

export default router;
