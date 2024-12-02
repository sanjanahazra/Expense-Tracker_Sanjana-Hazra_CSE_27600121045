const mongoose = require('mongoose');
// Define the Expense schema
const expenseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Expense name is mandatory
      trim: true, // Removes leading and trailing whitespaces
    },
    category: {
      type: String,
      required: true, // Expense category is mandatory
      enum: ['Food', 'Transport', 'Entertainment', 'Other'], // Predefined categories
    },
    amount: {
      type: Number,
      required: true, // Expense amount is mandatory
      min: [0, 'Amount cannot be negative'], // Ensure amount is non-negative
    },
    date: {
      type: Date,
      required: true, // Date of expense is mandatory
      validate: {
        validator: (value) => value <= new Date(), // Ensure the date is not in the future
        message: 'Expense date cannot be in the future.',
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Link the expense to a specific user
      required: true, // User association is mandatory
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }

);


// Pre-save middleware to log whenever an expense is saved
expenseSchema.pre('save', function (next) {
  console.log(`Expense "${this.name}" is about to be saved.`);
  next();
});

// Static method to find expenses by user
expenseSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId }).sort({ date: -1 }); // Fetch expenses for a user, sorted by date (most recent first)
};


// Create and export the model
module.exports = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
