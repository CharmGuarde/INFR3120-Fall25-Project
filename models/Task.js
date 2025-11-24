// models/Task.js
const mongoose = require('mongoose');

// Task schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String
});

// Export model
module.exports = mongoose.model('Task', taskSchema);
