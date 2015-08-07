var mongoose = require('mongoose');
var config = require('../config.js');

var Schema = mongoose.Schema;

var answerSchema = new Schema({
  keyword: String,
  answers: [String]
  }, {collection: 'answer'});

module.exports = mongoose.model('room', answerSchema);