// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------
require('dotenv').config();                 // Load environment variables
const express = require('express');         // Web framework
const mongoose = require('mongoose');       // MongoDB
const path = require('path');               // File paths
const bcrypt = require('bcrypt');           // Password hashing
const session = require('express-session'); // Login sessions
const expressLayouts = require('express-ejs-layouts');

// Models
const User = require('./models/User');      // User model
const Task = require('./models/Task');      // Task model (ONLY THIS VERSION!)

const app = express();
const PORT = process.env.PORT || 3000;


// --------------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------------
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.static(path.join(__dirname, 'public'))); // Static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(expressLayouts);
app.set('layout', 'layout'); // Default layout file

// Session configuration (used for login)
app.use(
  session({
    secret: 'supersecretkey123', // You can replace this
    resave: false,
    saveUninitialized: false,
  })
);

// Make userId available inside ALL ejs pages
app.use((req, res, next) => {
  res.locals.user = req.session.userId;
  next();
});


// --------------------------------------------------------
// DATABASE CONNECTION
// --------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas Cloud"))
  .catch((err) => console.error("❌ MongoDB Error:", err));


// --------------------------------------------------------
// AUTHENTICATION ROUTES
// --------------------------------------------------------

// Registration page (GET)
app.get("/register", (req, res) => {
  res.render("register");
});

// Handle registration (POST)
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    username,
    password: hashedPassword,
  });

  res.redirect("/login");
});

// Login page (GET)
app.get("/login", (req, res) => {
  res.render("login");
});

// Handle login (POST)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Find user in DB
  const user = await User.findOne({ username });
  if (!user) return res.send("User not found.");

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.send("Incorrect password.");

  // Save user login into session
  req.session.userId = user._id;
  res.redirect("/tasks");
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});


// --------------------------------------------------------
// LOGIN PROTECTION MIDDLEWARE
// --------------------------------------------------------
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}


// --------------------------------------------------------
// MAIN ROUTES
// --------------------------------------------------------

// Home
app.get("/", (req, res) => res.render("home"));

// About
app.get("/about", (req, res) => res.render("about"));

// Contact (GET)
app.get("/contact", (req, res) => res.render("contact"));

// Contact (POST)
app.post("/contact", (req, res) => {
  console.log("Contact Submission:", req.body);
  res.redirect("/");
});

// Show tasks → PROTECTED
app.get("/tasks", requireLogin, async (req, res) => {
  const tasks = await Task.find();
  res.render("index", { tasks });
});

// Create task
app.post("/add", requireLogin, async (req, res) => {
  const { title, description } = req.body;
  if (title) await Task.create({ title, description });
  res.redirect("/tasks");
});

// Edit task
app.post("/edit/:id", requireLogin, async (req, res) => {
  await Task.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/tasks");
});

// Delete task
app.post("/delete/:id", requireLogin, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect("/tasks");
});


// --------------------------------------------------------
// START SERVER
// --------------------------------------------------------
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
