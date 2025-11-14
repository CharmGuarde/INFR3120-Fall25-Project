require('dotenv').config(); // loads environment variables from .env file
const express = require('express'); // web framework
const mongoose = require('mongoose'); // MongoDB ODM
const path = require('path'); // utility for handling file paths


const app = express(); // initialize express app
const PORT = process.env.PORT || 3000; // server port

// ------------------------------ MIDDLEWARE -------------------------------- //


app.use(express.urlencoded({ extended: true })); // parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public'))); // serve static files
app.set('view engine', 'ejs'); // set EJS as templating engine
app.set('views', path.join(__dirname, 'views')); // set views directory

// ------------------------------ MONGO STUFF ---------------------------------  //

// connects to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI) // connection string from .env
  .then(() => console.log('✅ Connected to MongoDB Atlas Cloud')) // success message
  .catch(err => console.error('❌ MongoDB Connection Error:', err)); // error handling

// define schema and model
const taskSchema = new mongoose.Schema({ // task schema
  title: { type: String, required: true }, // title is required
  description: String // optional description
});

const Task = mongoose.model('Task', taskSchema); // task model

// -------------------------------- ROUTES -------------------------------- //

// contact page
app.get('/contact', (req, res) => {
  res.render('contact');
});

// home page
app.get('/', (req, res) => res.render('home'));

// index page
app.get('/index', (req, res) => {
  res.render('index');
});
// read: list all tasks
app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.render('index', { tasks });
});

// create: adds a new task
app.post('/add', async (req, res) => {
  const { title, description } = req.body;
  if (title) await Task.create({ title, description });
  res.redirect('/tasks');
});

// update: edit an existing task
app.post('/edit/:id', async (req, res) => {
  const { title, description } = req.body;
  await Task.findByIdAndUpdate(req.params.id, { title, description });
  res.redirect('/tasks');
});

// delete: remove a task
app.post('/delete/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect('/tasks');
});



// start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
