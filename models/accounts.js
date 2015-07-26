var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var friendSchema = new Schema({
    friend: {type: mongoose.Schema.Types.ObjectId, ref: 'account'},
    accept: {type: Boolean, default: false},
    time: {type: Date, default: Date.now()}
});

var accountSchema = new Schema({
  username: String, 
  nickname: String,
  password: String,
  email: String,
  friends: [friendSchema],
  point: { type: Number, default: 0 },
  reputation: String,
  guest: Boolean,
  facebook: Schema.Types.ObjectId
  }, {collection: 'account'});

module.exports = mongoose.model('account', accountSchema);