// -------------------------------------------------------
// IMPORTS & ENV SETUP
// -------------------------------------------------------
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

// Load Models
const Task = require('./models/Task');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;


// -------------------------------------------------------
// MIDDLEWARE
// -------------------------------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(
  session({
    secret: 'supersecretkey123',
    resave: false,
    saveUninitialized: false
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.userId;
  res.locals.username = req.session.username;
  next();
});


// -------------------------------------------------------
// DATABASE CONNECTION
// -------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB Error:', err));


// -------------------------------------------------------
// LOGIN PROTECTION
// -------------------------------------------------------
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}


// -------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------
app.get('/register', (req, res) => res.render('register'));

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ username, email, password: hashedPassword });
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null }); 
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  
  if (!user) {
    return res.render('login', { error: "User not found." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render('login', { error: "Incorrect password." });
  }

  req.session.userId = user._id;
  req.session.username = user.username;
  res.redirect('/tasks');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Reset Password Page
app.get('/reset-password', requireLogin, (req, res) => {
  res.render('reset-password', { message: null });
});

app.post('/reset-password', requireLogin, async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.render('reset-password', { message: 'Passwords do not match!' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(req.session.userId, { password: hashedPassword });

  res.render('reset-password', { message: 'Password updated successfully!' });
});


// -------------------------------------------------------
// GENERAL ROUTES
// -------------------------------------------------------
app.get('/', (req, res) => res.render('home'));
app.get('/about', (req, res) => res.render('about'));
app.get('/contact', (req, res) => res.render('contact'));

app.post('/contact', (req, res) => {
  res.render('contact-success', { name: req.body.name });
});

app.get('/settings', requireLogin, (req, res) => res.render('settings'));


// -------------------------------------------------------
// TASK ROUTES
// -------------------------------------------------------
app.get('/tasks', requireLogin, async (req, res) => {
  const tasks = await Task.find({ user: req.session.userId });
  res.render('index', { tasks });
});

app.post('/add', requireLogin, async (req, res) => {
  const { title, description, dueDate } = req.body;

  await Task.create({
    user: req.session.userId,
    title,
    description,
    dueDate: dueDate ? new Date(dueDate) : null,
    completed: false
  });

  res.redirect('/tasks');
});

app.post('/toggle/:id', requireLogin, async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.session.userId });
  if (!task) return res.redirect('/tasks');

  task.completed = !task.completed;
  await task.save();
  res.redirect('/tasks');
});

app.post('/delete/:id', requireLogin, async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, user: req.session.userId });
  res.redirect('/tasks');
});

// Edit Task Page
app.get('/edit/:id', requireLogin, async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.session.userId });
  if (!task) return res.redirect('/tasks');

  res.render('edit', { task });
});

// Update Task
app.post('/edit/:id', requireLogin, async (req, res) => {
  await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.session.userId },
    req.body
  );
  res.redirect('/tasks');
});


// -------------------------------------------------------
// START SERVER
// -------------------------------------------------------
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
