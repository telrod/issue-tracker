import express from 'express';
import log from 'log';
import multer from 'multer';
import config from 'config';
import fs from 'fs';
import del from 'del';

import { Issue, Document } from 'models';

const router = new express.Router();
const upload = multer({dest: config.uploadPath});

/**
 * @swagger
 * /issue:
 *   get:
 *     summary: Get all issues
 *     description: Return all issues.
 *     tags:
 *       - Issue
 *     parameters:
 *      - in: query
 *        name: status
 *        type: string
 *        required: false
 *        description: filter issues by status (TODO, IN PROGRESS, DONE)
 *      - in: query
 *        name: priority
 *        type: string
 *        required: false
 *        description: filter issues by priority (Critical, Major, Minor, Trivial)
 *     responses:
 *       200:
 *         description: Array of issues
 *         schema:
 *           type: array
 *           items:
 *            $ref: '#/definitions/Issue'
 */
router.get('/', async (req, res, next) => {
  try {
    let issues = {};
    const query = req.query;
    if(query) {
      issues = await Issue.find(query).populate('attachments');
    } else {
      issues = await Issue.find().populate('attachments');
    }
    return res.send({issues});
  } catch (err) {
    log.error("Error geeting issues", err);
    next(err);
  }
});

/**
 * @swagger
 * /issue/{issueId}:
 *   get:
 *     tags:
 *       - Issue
 *     summary: Get an issue
 *     description: Gets a specific issue by id
 *     parameters:
 *       - name: issueId
 *         in: path
 *         type: string
 *         required: true
 *         description: Id of issue to be fetched
 *     responses:
 *       200:
 *         description: An issue object
 *         schema:
 *          $ref: '#/definitions/Issue'
 */
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

/**
 * @swagger
 * /issue:
 *   post:
 *     summary: Create issue
 *     description: Create new issue
 *     tags:
 *       - Issue
 *     parameters:
 *       - name: issue
 *         in: body
 *         required: true
 *         schema:
 *          $ref: '#/definitions/NewIssue'
 *     responses:
 *       201:
 *         description: New issue
 *         headers:
 *          Location:
 *            type: string
 *            description: URL to fetch newly created issue
 *         schema:
 *          $ref: '#/definitions/Issue'
 */
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

/**
 * @swagger
 * /issue/{issueId}:
 *   put:
 *     summary: Overwrite issue
 *     description: Replaces contents of issue (i.e. overwrite). If attributes passed are empty, will be replaced with empty attributes in datastore.  Attributes to not be updated would be id, createdAt, updatedAt, and attachments.
 *     tags:
 *       - Issue
 *     parameters:
 *       - name: issueId
 *         in: path
 *         type: string
 *         required: true
 *         description: Id of issue to be overwritten
 *       - name: issue
 *         in: body
 *         required: true
 *         schema:
 *          $ref: '#/definitions/Issue'
 *     responses:
 *       200:
 *         description: Updated issue
 *         schema:
 *          $ref: '#/definitions/Issue'
 */
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

/**
 * @swagger
 * /issue/{issueId}:
 *   patch:
 *     summary: Update issue
 *     description: Updates contents of issue for the attributes passed in request body and only the attributes passed (i.e. attributes not passed will remain the same).
 *     tags:
 *       - Issue
 *     parameters:
 *       - name: issueId
 *         in: path
 *         type: string
 *         required: true
 *         description: Issue ID to be update
 *       - name: issue
 *         in: body
 *         required: true
 *         schema:
 *          $ref: '#/definitions/Issue'
 *     responses:
 *       200:
 *         description: Updated issue
 *         schema:
 *          $ref: '#/definitions/Issue'
 */
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

/**
 * @swagger
 * /issue/{issueId}:
 *   delete:
 *     summary: Remove issue
 *     description: Deletes issue by specified id.
 *     tags:
 *       - Issue
 *     parameters:
 *       - name: issueId
 *         in: path
 *         type: string
 *         required: true
 *         description: Id for issue to be deleted
 *     responses:
 *       204:
 *         description: No content if successful
 */
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

/*****************
 * Attachments   *
 *****************/

/**
 * @swagger
 * /issue/{issueId}/attachment:
 *   post:
 *     summary: Create an attachment
 *     description: Uploads file as attachment to specified issue
 *     tags:
 *       - Attachment
 *     consumes:
 *      - multipart/form-data
 *     parameters:
 *       - name: issueId
 *         in: path
 *         type: string
 *         required: true
 *         description: Id for issue create attachment for
 *       - in: formData
 *         name: attachment
 *         type: file
 *         description: The file to upload
 *     responses:
 *       201:
 *         description: New attachment
 *         headers:
 *          Location:
 *            type: string
 *            description: URL to fetch newly created issue
 *         schema:
 *          $ref: '#/definitions/Document'
 */
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

/**
 * @swagger
 * /issue/{issueId}/attachment/{attachmentId}:
 *   get:
 *     tags:
 *       - Attachment
 *     summary: Get an attachment
 *     description: Streams a specific attachment file by issue and attachment id
 *     produces:
 *      - image/png
 *      - image/gif
 *      - image/jpeg
 *     parameters:
 *       - name: issueId
 *         in: path
 *         type: string
 *         required: true
 *         description: Id of issue to be fetched
 *       - name: attachmentId
 *         in: path
 *         type: string
 *         required: true
 *         description: Id of attachment to be fetched
 *     responses:
 *       200:
 *         description: An attachment file
 *         schema:
 *          type: file
 */
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

/**
 * @swagger
 * /issue/{issueId}/attachment/{attachmentId}:
 *   delete:
 *     summary: Remove an attachment
 *     description: Deletes issue attachment by specified id.
 *     tags:
 *       - Attachment
 *     parameters:
 *       - name: issueId
 *         in: path
 *         type: string
 *         required: true
 *         description: Id for issue
 *       - name: attachmentId
 *         in: path
 *         type: string
 *         required: true
 *         description: Id of attachment to be deleted
 *     responses:
 *       204:
 *         description: No content if successful
 */
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

/*****************
 * Comments      *
 *****************/

/**
 * @swagger
 * /issue/{issueId}/comment:
 *   post:
 *     summary: Create comment
 *     description: Adds comment to issue
 *     tags:
 *       - Comment
 *     parameters:
 *       - in: body
 *         name: comment
 *         schema:
 *          type: object
 *          properties:
 *            message:
 *              type: string
 *       - name: issueId
 *         in: path
 *         type: string
 *         required: true
 *         description: Id for issue create comment for
 *     responses:
 *       201:
 *         description: New comment
 *         schema:
 *          type: object
 *          properties:
 *            message:
 *              type: string
 *            createdAt:
 *              type: string
 *              format: date-time
 */
router.post('/:id/comment', async(req, res, next) => {
  if (!req.is('application/json')) {
    return next(
      new Error("Expects Content-Type: 'application/json'")
    );
  }

  const id = req.params.id;

  try {
    // first need to check that id is valid for an issue
    let existingIssue = await Issue.findById({_id: id});
    if (!existingIssue) {
      return res.status(404).json({msg: 'Issue not found by id: ' + id});
    } else {
      const data = req.body || {};
      log.debug("comment message: " + data);
      let comment = {
        message: data.message,
        createdAt: new Date()
      };
      // now update the issue to include new comment
      existingIssue.comments.push(comment);
      await existingIssue.save();

      log.debug('Created comment: ' + comment);
      return res.status(201).send(comment);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }

});

/**
 * @swagger
 * /issue/{issueId}/comment:
 *   get:
 *     summary: Get comments
 *     description: Gets all comments for a specified issue
 *     tags:
 *       - Comment
 *     parameters:
 *       - name: issueId
 *         in: path
 *         type: string
 *         required: true
 *         description: Id for issue get comments for
 *     responses:
 *       200:
 *         description: All issue comments
 *         schema:
 *          type: array
 *          items:
 *            properties:
 *              message:
 *                type: string
 *              createdAt:
 *                type: string
 *                format: date-time
 */
router.get('/:id/comment', async(req, res, next) => {
  const id = req.params.id;

  try {
    // first need to check that id is valid for an issue
    let existingIssue = await Issue.findById({_id: id});
    if (!existingIssue) {
      return res.status(404).json({msg: 'Issue not found by id: ' + id});
    } else {
      let comments = existingIssue.comments;
      return res.send(comments);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }

});


export default router;
