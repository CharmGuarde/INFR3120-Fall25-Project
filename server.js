// server.js
const User = require('./models/User');
const bcrypt = require('bcrypt');

//Register:Create a new user
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  //Hash password
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  //Save user
  await User.create({
    username: req.body.username,
    password: hashedPassword
  });

  res.redirect('/login');
});

//Login Page
app.get('/login', (req, res) => {
  res.render('login');
});

//Login Logic
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  //Find user
  const user = await User.findOne({ username });
  if (user) {
    //Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!ismatch) {
      return res.send('Invalid username or password');
    }
    //Successful login:Save user id in session
    req.session.userId = user._id;
    return res.redirect('/tasks');
  }

  const session = require('express-session'); // session management

require('dotenv').config(); // loads environment variables from .env file
import express, { urlencoded } from 'express'; // web framework
import { connect, Schema, model } from 'mongoose'; // MongoDB ODM
import { join } from 'path'; // utility for handling file paths
import expressLayouts from 'express-ejs-layouts'; // layout engine

const app = express(); // initialize express app
const PORT = process.env.PORT || 3000; // server port

// ------------------------------ MIDDLEWARE -------------------------------- //

app.use(urlencoded({ extended: true })); // parse URL-encoded bodies
app.use(express.static(join(__dirname, 'public'))); // serve static files
app.set('view engine', 'ejs'); // set EJS as templating engine
app.set('views', join(__dirname, 'views')); // set views directory

app.use(expressLayouts);              // enable layout engine
app.set('layout', 'layout');          // default layout file = views/layout.ejs

app.use(session({
  secret:'supersecretkey123', resave:false, saveUninitialized:false
})); // session management
// ------------------------------ MONGO STUFF ---------------------------------  //

connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas Cloud'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const taskSchema = new Schema({
  title: { type: String, required: true },
  description: String
});

const Task = model('Task', taskSchema);

//------------------------------ CUSTOM MIDDLEWARE ------------------------------ //

// make user ID available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.userId;
  next();
});

// -------------------------------- ROUTES -------------------------------- //

// contact page
app.get('/contact', (req, res) => {
  res.render('contact');
});

// handle contact form submission
app.post('/contact', (req, res) => {
  console.log('Contact Form Submission:', req.body);
  console.log('Name:', req.body.name);
  console.log('Email:', req.body.email);
  console.log('Message:', req.body.message);
  res.redirect('/'); // redirect to home page after submission

  res.send('div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;"><h2>Thank you for contacting us!</h2><p>We have received your message and will get back to you shortly.</p><a href="/" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">Return to Home Page</a></div>');
});

// home page
app.get('/', (req, res) => res.render('home'));

// about page
app.get('/about', (req, res) => res.render('about'));

// tasks page
app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.render('index', { tasks });
});

// create task
app.post('/add', async (req, res) => {
  const { title, description } = req.body;
  if (title) await Task.create({ title, description });
  res.redirect('/tasks');
});

// update task
app.post('/edit/:id', async (req, res) => {
  const { title, description } = req.body;
  await Task.findByIdAndUpdate(req.params.id, { title, description });
  res.redirect('/tasks');
});

// delete task
app.post('/delete/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect('/tasks');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));