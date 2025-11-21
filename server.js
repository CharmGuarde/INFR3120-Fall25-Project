require('dotenv').config(); // loads environment variables from .env file
const express = require('express'); // web framework
const mongoose = require('mongoose'); // MongoDB ODM
const path = require('path'); // utility for handling file paths
const expressLayouts = require('express-ejs-layouts'); // layout engine

const app = express(); // initialize express app
const PORT = process.env.PORT || 3000; // server port

// ------------------------------ MIDDLEWARE -------------------------------- //

app.use(express.urlencoded({ extended: true })); // parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public'))); // serve static files
app.set('view engine', 'ejs'); // set EJS as templating engine
app.set('views', path.join(__dirname, 'views')); // set views directory

app.use(expressLayouts);              // enable layout engine
app.set('layout', 'layout');          // default layout file = views/layout.ejs

// ------------------------------ MONGO STUFF ---------------------------------  //

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas Cloud'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String
});

const Task = mongoose.model('Task', taskSchema);

// -------------------------------- ROUTES -------------------------------- //

// contact page
app.get('/contact', (req, res) => {
  res.render('contact');
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

// start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
