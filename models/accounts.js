var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var accountSchema = new Schema({
  username: String, 
  nickname: String,
  password: String,
  email: String,
  friends: { type: Number, default: 0 },
  point: { type: Number, default: 0 },
  reputation: String,
  guest: Boolean,
  facebook: Schema.Types.ObjectId
  }, {collection: 'account'});
  

module.exports = mongoose.model('contact', accountSchema);