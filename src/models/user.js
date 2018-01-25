import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  username: String,
  password: String,
  role: String,
  token: String
});

UserSchema.options.toJSON = UserSchema.options.toJSON || {};
UserSchema.options.toJSON.transform = (doc, ret) => {
  ret.id = doc._id;
  delete ret.__v;
  delete ret._id;
  delete ret.password;
  return ret;
};

const User = mongoose.model('user', UserSchema);

/**
 * @swagger
 * definitions:
 *   User:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *         default: objectId
 *       username:
 *         type: string
 *         default: NAME
 *       role:
 *         type: string
 *         default: ROLE
 *       token:
 *         type: string
 *         default: TOKEN
 */

export default User;
