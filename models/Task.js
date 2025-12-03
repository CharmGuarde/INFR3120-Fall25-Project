const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  priority: { type: String, default: "Medium" },
  completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Task', taskSchema);
