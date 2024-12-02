const express = require('express');

const router = express.Router();
const Expense = require('../models/Expense'); // Import your Mongoose model for expenses
const authenticateJWT = require('../middlewares/authenticateJWT'); // Import JWT authentication middleware

// Route to fetch expenses with optional filters
router.get('/expenses', async (req, res) => {
  try {
    const { date, month, year } = req.query;
    let filter = {};

    if (date) {
      filter.date = {
        $gte: new Date(date), // Start of the day
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)), // End of the day
      };
    } else if (month) {
      const [yearPart, monthPart] = month.split('-');
      filter.date = {
        $gte: new Date(`${yearPart}-${monthPart}-01`), // Start of the month
        $lt: new Date(new Date(`${yearPart}-${monthPart}-01`).setMonth(parseInt(monthPart, 10))), // Start of the next month
      };
    } else if (year) {
      filter.date = {
        $gte: new Date(`${year}-01-01`), // Start of the year
        $lt: new Date(`${parseInt(year, 10) + 1}-01-01`), // Start of the next year
      };
    }

    const expenses = await Expense.find(filter); // Fetch expenses from database
    res.json(expenses); // Send expenses back to the client
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).send('Server Error');
  }
});

// Ensure the user is authenticated before accessing the expenses route
router.get('/', authenticateJWT, async (req, res) => {
    try {
      const { date, month, year } = req.query;
      let filter = { user: req.user.userId }; // Only fetch expenses for the authenticated user
  
      // Apply date filter if provided
      if (date) {
        filter.date = {
          $gte: new Date(date), // Start of the day
          $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)), // End of the day
        };
      } else if (month) {
        const [yearPart, monthPart] = month.split('-');
        filter.date = {
          $gte: new Date(`${yearPart}-${monthPart}-01`), // Start of the month
          $lt: new Date(new Date(`${yearPart}-${monthPart}-01`).setMonth(parseInt(monthPart, 10))), // Start of the next month
        };
      } else if (year) {
        filter.date = {
          $gte: new Date(`${year}-01-01`), // Start of the year
          $lt: new Date(`${parseInt(year, 10) + 1}-01-01`), // Start of the next year
        };
      }
  
      // Fetch expenses from the database based on the filter
      const expenses = await Expense.find(filter); 
      res.json(expenses); // Send expenses back to the client
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).send('Server Error');
    }
  });
  


// Get expenses for the logged-in user
  router.get('/', async (req, res) => {
    try {
      const expenses = await Expense.find({ user: req.user.userId }).sort({ date: -1 });
      res.json(expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({ message: 'Error fetching expenses' });
    }
  });





  // Route to add a new expense (POST request)
  // router.post('/api/expenses', authenticateJWT, async (req, res) => {
  router.post('/', async (req, res) => {
    const { name, amount, date, category } = req.body;
    try {
      // Create a new expense document linked to the authenticated user
      const newExpense = new Expense({
        name,
        amount,
        date,
        category,
        user: req.user.userId, // Link the expense to the logged-in user
      });
  
      // Save the new expense in the database
      await newExpense.save();
      res.status(201).json({ message: 'Expense added successfully!' });
    } catch (error) {
      console.error('Error adding expense:', error);
      res.status(500).json({ error: 'Failed to add expense. Please try again.' });
    }
  });


module.exports = router; // Export the router
