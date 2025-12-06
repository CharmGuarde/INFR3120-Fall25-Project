const mongoose = require('mongoose');

// User schema: stores username + hashed password
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true   // prevents duplicate usernames for the different user accounts 
  },
  password: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('User', userSchema);
