var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
const ObjectId = require('mongoose').Types.ObjectId; 

const NotificationChannel = require('../probe-shared/models/notification-channel');
const NotificationPolicy = require('../probe-shared/models/notification-policy');
const NotificationHistory = require('../probe-shared/models/notification-log');


var UserSchema = new Schema({
    
    name: {
        type: String,
        required: true
    },
    
    email: {
        type: String,
        unique: true,
        required: true
    },
  
    password: {
        type: String,
        required: true
    },

    isVerified:{
        type:Boolean,
        default:false
    }
});

UserSchema.pre('remove',function(next){
 
    let cond = {user_id:this._id};

    Promise.all([   
            NotificationChannel.deleteMany(cond),
            NotificationPolicy.deleteMany(cond),
            NotificationHistory.deleteMany(cond)
        ]).then(
        next(null, { success:true })
    ).catch(next)
})

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next(null, user);
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);