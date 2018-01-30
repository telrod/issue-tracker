import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';

const Schema = mongoose.Schema;
const IssueSchema = new Schema({
  title: {type: String, required: [true, 'Issue requires title']},
  priority: {type: String, enum: ['Critical', 'Major', 'Minor', 'Trivial'], default: 'Major'},
  status: {type: String, enum: ['TODO', 'IN PROGRESS', 'DONE'], default: 'TODO'},
  description: {type: String, default: null},
  attachments: [{type: Schema.Types.ObjectId, ref: 'document'}],
  comments: [{message: String, createdAt: Date}]
});
IssueSchema.plugin(timestamps);

IssueSchema.options.toJSON = IssueSchema.options.toJSON || {};
// Don't want to expose underlying datastore to API clients
IssueSchema.options.toJSON.transform = (doc, ret) => {
  ret.id = doc._id;
  delete ret.__v;
  delete ret._id;
  return ret;
};

const Issue = mongoose.model('issue', IssueSchema);

/**
 * @swagger
 * definitions:
 *   NewIssue:
 *     type: object
 *     required:
 *      - title
 *      - priority
 *      - status
 *     properties:
 *       title:
 *         type: string
 *       priority:
 *         type: string
 *         enum: ['Critical', 'Major', 'Minor', 'Trivial']
 *       status:
 *         type: string
 *         enum: ['TODO', 'IN PROGRESS', 'DONE']
 *       description:
 *         type: string
 *   Issue:
 *     type: object
 *     required:
 *      - id
 *      - title
 *      - priority
 *      - status
 *     properties:
 *       id:
 *         type: string
 *         default: objectId
 *       createdAt:
 *         type: string
 *         format: date-time
 *       updatedAt:
 *         type: string
 *         format: date-time
 *       title:
 *         type: string
 *       priority:
 *         type: string
 *         enum: ['Critical', 'Major', 'Minor', 'Trivial']
 *       status:
 *         type: string
 *         enum: ['TODO', 'IN PROGRESS', 'DONE']
 *       description:
 *         type: string
 *       attachments:
 *         type: array
 *         items:
 *          $ref: '#/definitions/Document'
 *       comments:
 *         type: array
 *         items:
 *          properties:
 *            message:
 *              type: string
 *            createdAt:
 *              type: string
 *              format: date-time
 */

export default Issue;
