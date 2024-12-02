// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

require('dotenv').config();


// const User = require('./models/User');

// Import routes
const authRoutes = require('./routes/auth'); // Authentication routes
const protectedRoutes = require('./routes/protected'); // Protected routes
const expenseRoutes = require('./routes/expenses'); // Expense routes 

// MongoDB URI - Use your actual MongoDB URI
const mainDbURI = 'mongodb+srv://hazrasanjana2004:prithwish1234@cluster0.s6h5g.mongodb.net/';

const authDbURI = 'mongodb+srv://hazrasanjana2004:sanjana1234@cluster0.q4n0j.mongodb.net/';


// Initialize the app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" folder

// app.use('/', express.static(path.join(__dirname, 'public/html')));

// Connect to MongoDB
mongoose.connect(mainDbURI)
  .then(() => console.log('Main MongoDB connected for Expenses'))
  .catch((err) => console.error('Main MongoDB connection error:', err));


// Use a separate connection for authentication-related data
const authConnection = mongoose.createConnection(authDbURI);

authConnection.on('connected', () => console.log('Auth MongoDB connected for Signup/Signin'));
authConnection.on('error', (err) => console.error('Auth MongoDB connection error:', err));



// Define the Expense and user model (Mongoose schema)

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = authConnection.model('User', userSchema);








// Define Expense schema
const expenseSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  date: Date,
  category: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Reference to User
});

// Model for Expense
const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

// // Model for User
// const User = mongoose.models.User || mongoose.model('User', userSchema);









// Middleware for JWT authentication
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(403).json({ message: 'Access denied, no token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user; // Attach the user to the request
    next();
  });
};

// Route for the root URL
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html', 'home.html')); // Make sure the HTML file is in the 'public' folder
});
// // Routes for signup and signin
// app.use('/api/auth', (req, res, next) => {
//   req.authDb = authConnection; 
//   // Attach auth DB connection to the request
//   next();
// }, authRoutes);

// Routes for expenses handling
app.use('/api/expenses', authenticateJWT, expenseRoutes); // Protect expense routes

// Protected routes example
app.use('/api', protectedRoutes);





// Get all expenses with filters
app.get('/api/expenses', async (req, res) => {
  try {

    // console.log("Query parameters received:", req.query);
    const { date, month, year } = req.query;
    let filter = {};

    if (date) {
      // Parse the date and create the start and end of the day
      const selectedDate = new Date(date); // 'date' comes in format YYYY-MM-DD

      // If the date parsing fails, it could cause unexpected results.
      if (isNaN(selectedDate)) {
        return res.status(400).json({ error: 'Invalid date format' });
      }

      // Set the time to the start of the day (midnight)
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));

      // Set the time to the end of the day (11:59:59 PM)
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

      // Add the filter for the specific date range
      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    } else if (month) {
      // Handle month filter if present
      const [yearPart, monthPart] = month.split('-');
      filter.date = {
        $gte: new Date(`${yearPart}-${monthPart}-01`), // Start of the month
        $lt: new Date(`${yearPart}-${(parseInt(monthPart, 10) + 1).toString().padStart(2, '0')}-01`), // Start of the next month
      };
    } else if (year) {
      // Handle year filter if present
      filter.date = {
        $gte: new Date(`${year}-01-01`), // Start of the year
        $lt: new Date(`${parseInt(year, 10) + 1}-01-01`), // Start of the next year
      };
    }

    // Fetch expenses based on the filter
    const expenses = await Expense.find(filter);
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error.message);
    res.status(500).send('Server Error');
  }
});



// POST route to add expenses accepts up to today's date
app.post('/api/expenses', async (req, res) => {
  const { name, amount, date, category } = req.body;

  try {
    // Get today's date without time (set time to midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to midnight for comparison

    // Parse the provided date from the request body
    const expenseDate = new Date(date);
    expenseDate.setHours(0, 0, 0, 0); // Reset to midnight for comparison


    // Log the dates to debug
    console.log('Today:', today);
    console.log('Expense Date:', expenseDate);



    // Ensure the expense date is not in the future
    if (expenseDate > today) {
      return res
        .status(400)
        .json({ error: "Expenses can only be added for today or any past date." });
    }

    // Ensure the expense date is valid
    if (isNaN(expenseDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format provided." });
    }

    // Save the new expense to the database
    const Expense = mongoose.model('Expense');
    const newExpense = new Expense({
      name,
      amount,
      date: expenseDate, // Ensure the saved date matches the parsed date
      category,
    });

    await newExpense.save();
    res.status(201).json({ message: "Expense added successfully!" });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ error: "Failed to add expense. Please try again." });
  }
});

// Route: Edit an expense
app.put('/api/expenses/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { name, amount, date, category } = req.body;

  try {
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { name, amount, date, category },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).send('Server Error');
  }
});

// Route: Delete an expense
app.delete('/api/expenses/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedExpense = await Expense.findOneAndDelete({ _id: id, user: req.user._id });

    if (!deletedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).send('Server Error');
  }
});



//  routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/expenses', expenseRoutes); // Expense routes
app.use('/api', protectedRoutes); // Use protected route





// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});







