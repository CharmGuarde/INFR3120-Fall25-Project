require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas Cloud'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ✅ Define Schema and Model
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String
});

const Task = mongoose.model('Task', taskSchema);

// ✅ ROUTES

// Home page
app.get('/', (req, res) => res.render('home'));

// Read: List all tasks
app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.render('index', { tasks });
});

// Create: Add a new task
app.post('/add', async (req, res) => {
  const { title, description } = req.body;
  if (title) await Task.create({ title, description });
  res.redirect('/tasks');
});

// Update: Edit an existing task
app.post('/edit/:id', async (req, res) => {
  const { title, description } = req.body;
  await Task.findByIdAndUpdate(req.params.id, { title, description });
  res.redirect('/tasks');
});

// Delete: Remove a task
app.post('/delete/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect('/tasks');
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
