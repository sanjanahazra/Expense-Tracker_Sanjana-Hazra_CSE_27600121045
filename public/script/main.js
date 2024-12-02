// Add Expense Form Handling
document.getElementById('expense-form').addEventListener('submit', async function (event) {
    event.preventDefault();
  
    const name = document.getElementById('expense-name').value;
    const amount = document.getElementById('expense-amount').value;
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;
  
    const expenseData = { name, amount, date, category };
  
    // Send data to the backend
    const response = await fetch('http://localhost:5000/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });
  
    const result = await response.json();
    console.log('Expense added:', result);
    // Redirect to view expenses page
    window.location.href = 'viewExpense.html';
  });
  
  // Fetch and display expenses on View Expenses page
  async function fetchExpenses() {
    const response = await fetch('http://localhost:5000/api/expenses');
    const expenses = await response.json();
  
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = '';
    expenses.forEach(expense => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${expense.name}</td>
        <td>${expense.amount}</td>
        <td>${expense.date}</td>
        <td>${expense.category}</td>
      `;
      expenseList.appendChild(row);
    });
  }
  
  // Load expenses when the page is loaded
  document.addEventListener('DOMContentLoaded', fetchExpenses);
  