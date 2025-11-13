const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Temporary in-memory data
let tasks = [];
let nextId = 1;

// ROUTES
// Home Page
app.get('/', (req, res) => {
  res.render('home'); // render home.ejs
});

// Task Manager Page
app.get('/tasks', (req, res) => {
  res.render('index', { tasks });
});

// Add Task
app.post('/add', (req, res) => {
  const { title, description } = req.body;
  if (title) tasks.push({ id: nextId++, title, description });
  res.redirect('/tasks');
});

// Delete Task
app.post('/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  tasks = tasks.filter(t => t.id !== id);
  res.redirect('/tasks');
});

app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
