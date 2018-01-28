import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';

const Schema = mongoose.Schema;
const IssueSchema = new Schema({
  title: {type: String, required: [true, 'Issue requires title']},
  priority: {type: Number, required: [true, 'Issue requires priority']},
  status: {type: Number, required: [true, 'Issue requires status']},
  description: {type: String, default: null},
  attachments: [{ type: Schema.Types.ObjectId, ref: 'document' }],
  comments: [{ message: String, createdAt: Date }]
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


export default Issue;
