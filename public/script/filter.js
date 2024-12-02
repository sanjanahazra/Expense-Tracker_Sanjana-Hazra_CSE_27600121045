const mongoose = require('mongoose');
const Expense = require('./models/Expense'); // Replace with your schema file path

mongoose
  .connect('mongodb://localhost:27017/expenseTracker', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

async function seedExpenses() {
  const expenses = [
    { date: new Date('2024-11-01'), name: 'Groceries', category: 'Food', amount: 50 },
    { date: new Date('2024-11-10'), name: 'Gym Membership', category: 'Fitness', amount: 30 },
    { date: new Date('2024-12-01'), name: 'Rent', category: 'Housing', amount: 500 },
    { date: new Date('2024-12-15'), name: 'Electricity Bill', category: 'Utilities', amount: 75 },
  ];

  await Expense.insertMany(expenses);
  console.log('Expenses seeded');
  mongoose.disconnect();
}

seedExpenses();
