const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, /* ADDEDDD THIIIISS NEWWWWW */ 
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  priority: { type: String, default: "Medium" },
  completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Task', taskSchema);
