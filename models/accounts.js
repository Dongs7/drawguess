var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var friendSchema = new Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'account'},
    accept: {type: Boolean, default: false},
    time: {type: Date, default: Date.now()}
});

var accountSchema = new Schema({
    user_id: String,
    username: String,
    nickname: String,
    password: String,
    email: String,
    friends: [friendSchema],
    point: {type: Number, default: 0},
    level: {type: Number, default: 1},
    reputation: String,
    guest: Boolean,
    facebook: Schema.Types.ObjectId
}, {collection: 'account'});

accountSchema.methods.winner = function(id, score){
    var msg = '';
    this.model('account').findOne({ _id: id }, 
        {nickname: true, point: true, level: true},
        function(err, doc){
            if(err) throw err;
            if(score <= 0) return 'error: invalid score';
            var max = 10 * doc.level;
            doc.point += score;
            msg = 'Congratulations, Player ' + doc.nickname + ' get ' + score + ' points.';
            if(doc.point >= max){
                doc.level++;
                msg += ' Level Up!!!';
            }
            
            console.log('msg: ' + msg);
            doc.save(function (e){
                if(e) throw e;
            });
            return msg;
        });
}


module.exports = mongoose.model('account', accountSchema);