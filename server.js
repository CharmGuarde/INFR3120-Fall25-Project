// -------------------------------------------------------
//  IMPORTS & ENV SETUP
// -------------------------------------------------------
require('dotenv').config();                    // Load .env file
const express = require('express');            // Web framework
const mongoose = require('mongoose');          // MongoDB ODM
const path = require('path');                  // Work with file paths
const bcrypt = require('bcrypt');              // Password hashing
const session = require('express-session');    // Login sessions
const expressLayouts = require('express-ejs-layouts'); // Layout engine

// Load Models
const Task = require('./models/Task');         // Task model
const User = require('./models/User');         // User model

const app = express();
const PORT = process.env.PORT || 3000;


// -------------------------------------------------------
//  MIDDLEWARE
// -------------------------------------------------------
app.use(express.urlencoded({ extended: true }));      // Parse form data
app.use(express.static(path.join(__dirname, 'public'))); // Static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// User session setup
app.use(
  session({
    secret: 'supersecretkey123', 
    resave: false,
    saveUninitialized: false
  })
);

// Make user data available to every EJS page
app.use((req, res, next) => {
  res.locals.user = req.session.userId;
  res.locals.username = req.session.username;
  next();
});


// -------------------------------------------------------
//  DATABASE CONNECTION
// -------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas Cloud'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));


// -------------------------------------------------------
//  LOGIN PROTECTION MIDDLEWARE
// -------------------------------------------------------
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login'); // Force login first
  }
  next();
}


// -------------------------------------------------------
//  AUTH ROUTES
// -------------------------------------------------------

// Register page
app.get('/register', (req, res) => {
  res.render('register');
});

// Register user
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    username,
    email,
    password: hashedPassword
  });

  res.redirect('/login');
});

// Login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.send('User not found.');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.send('Incorrect password.');

  // Success → store session
  req.session.userId = user._id;
  req.session.username = user.username;

  res.redirect('/tasks');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// NEWWWW CODE ---------------

// Reset Password Page
app.get('/reset-password', requireLogin, (req, res) => {
  res.render('reset-password', { message: null });
});

// Handle Password Reset
app.post('/reset-password', requireLogin, async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  // Check if passwords match
  if (newPassword !== confirmPassword) {
    return res.render('reset-password', { message: "Passwords do not match!" });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user password in database
  await User.findByIdAndUpdate(req.session.userId, { password: hashedPassword });

  res.render('reset-password', { message: "Password updated successfully!" });
});
// NEWWWW CODE ----------------

// -------------------------------------------------------
//  GENERAL ROUTES
// -------------------------------------------------------
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.post('/contact', (req, res) => {
  res.render('contact-success', {
    name: req.body.name
  });
});

// NEWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW CODE -------------------------
// Settings Page
app.get('/settings', requireLogin, (req, res) => {
  res.render('settings');
});


// -------------------------------------------------------
//  TASK ROUTES
// -------------------------------------------------------

// Tasks page (login required)
app.get('/tasks', requireLogin, async (req, res) => {
  const tasks = await Task.find({ user:  req.session.userId }); /* ADDEDDD THIIIISS NEWWWWW */
  res.render('index', { tasks });
});

// Add task
app.post('/add', requireLogin, async (req, res) => {
  const { title, description, dueDate } = req.body;

  await Task.create({
    user: req.session.userId, /* ADDEDDD THIIIISS NEWWWWW */
    title,
    description,
    dueDate: dueDate ? new Date(dueDate) : null,
    completed: false 
  });

  res.redirect('/tasks');
});


// Toggle Completed (Done / Undo)
app.post('/toggle/:id', requireLogin, async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.session.userId });
  if (!task) return res.redirect('/tasks');
  task.completed = !task.completed;
  await task.save();
  res.redirect('/tasks');
});


// Delete task
app.post('/delete/:id', requireLogin, async (req, res) => {
  await Task.findOneAndDelete({_id: req.params.id, user: req.session.userId}); /* ADDEDDD THIIIISS NEWWWWW */
  res.redirect('/tasks');
});

// ------------------------------------------------------- newwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
// Edit Task Page
app.get('/edit/:id', requireLogin, async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.session.userId });
  if (!task) return res.redirect('/tasks');
  res.render('edit', { task });
});

// new aswell 
// Update task
app.post('/edit/:id', requireLogin, async (req, res) => {
  await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.session.userId },
    req.body
  );
  res.redirect('/tasks');
});



// -------------------------------------------------------
//  START SERVER
// -------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
