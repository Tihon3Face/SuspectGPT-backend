const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  role: String,
  createdAt: {
    type: String,
    default: function() {
      const now = new Date();
      now.setTime(now.getTime() + 5 * 60 * 60 * 1000);
      return `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`;
    }
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;