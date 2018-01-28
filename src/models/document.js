import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';

const Schema = mongoose.Schema;
const DocumentSchema = new Schema({
  name: {type: String, required: [true, 'Document requires name']},
  encoding: {type: String},
  mimetype: {type: String, required: [true, 'Document requires mimetype']},
  size: {type: Number}, // size in bytes
  filename: {type: String, required: [true, 'Document requires filename']},
  path: {type: String}
});
DocumentSchema.plugin(timestamps);

DocumentSchema.options.toJSON = DocumentSchema.options.toJSON || {};
// Don't want to expose underlying datastore to API clients
DocumentSchema.options.toJSON.transform = (doc, ret) => {
  ret.id = doc._id;
  delete ret.__v;
  delete ret._id;
  delete ret.filename;
  delete ret.path;
  return ret;
};

const Document = mongoose.model('document', DocumentSchema);


export default Document;
