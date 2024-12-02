// Fetch expenses and populate the table

async function loadExpenses(queryParams = '') {
    try {
      const response = await fetch(`http://localhost:5000/api/expenses${queryParams}`);

      const expenses = await response.json();
  
      const expenseList = document.getElementById('expense-list');
      expenseList.innerHTML = ''; 
      // Clear previous entries
  
      if (expenses.length === 0) {
        expenseList.innerHTML = `<tr><td colspan="5" class="text-center">No expenses found</td></tr>`;
      } else {
        expenses.forEach((expense, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td>${expense.name}</td>
            <td>${expense.category}</td>
            <td>INR ${expense.amount.toFixed(2)}</td>
            <td>
            <button class="btn btn-warning btn-sm" onclick="editExpense('${expense.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteExpense('${expense.id}')">Delete</button>
          </td>
          `;
          expenseList.appendChild(row);
        });
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  }
  

// Edit an expense
async function editExpense(expenseId) {
  try {
      const response = await fetch(`http://localhost:5000/api/expenses/${expenseId}`);


      const expense = await response.json();

      // Ensure that the request was successful
      if (!response.ok) {
          alert('Error fetching expense data.');
          return;
      }

      // Prompt for updated values
      const name = prompt('Edit Name:', expense.name);
      const category = prompt('Edit Category:', expense.category);
      const date = prompt('Edit Date (YYYY-MM-DD):', expense.date.split('T')[0]);
      const amount = prompt('Edit Amount:', expense.amount);

      // Check if any value is empty and prompt to fill all fields
      if (!name || !category || !date || !amount) {
          alert('All fields are required!');
          return;
      }

      // Prepare the updated expense object
      const updatedExpense = {
          name,
          category,
          date,
          amount: parseFloat(amount)
      };

      // Send PUT request to update the expense
      const updateResponse = await fetch(`http://localhost:5000/api/expenses/${expenseId}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedExpense)
      });

      if (updateResponse.ok) {
          alert('Expense updated successfully.');
          loadExpenses(); // Reload expenses after update
      } else {
          alert('Error updating expense.');
      }
  } catch (error) {
      console.error('Error editing expense:', error);
      alert('An error occurred while editing the expense.');
  }
}



// Delete an expense
async function deleteExpense(expenseId) {
  const confirmDelete = confirm('Are you sure you want to delete this expense?');
  if (!confirmDelete) return;

  try {
      const response = await fetch(`http://localhost:5000/api/expenses/${expenseId}`, {
          method: 'DELETE'
      });

      if (response.ok) {
          alert('Expense deleted successfully.');
          loadExpenses(); // Reload expenses after deletion
      } else {
          alert('Error deleting expense.');
      }
  } catch (error) {
      console.error('Error deleting expense:', error);
      alert('An error occurred while deleting the expense.');
  }
}



  // Display filter input based on type
  function showFilter(filterType) {
    const filterInput = document.getElementById('filterInput');
    filterInput.innerHTML = ''; // Clear previous input
    filterInput.style.display = 'inline-block';
  
    if (filterType === 'date') {
      // Date filter
      filterInput.innerHTML = `
        <input type="date" class="form-control d-inline-block" id="filterDate">
        <button id="date-ok-button" class="btn btn-primary ms-2">OK</button>
      `;
      document.getElementById('date-ok-button').addEventListener('click', () => applyFilter('date'));
    } else if (filterType === 'month') {
      // Month and Year dropdowns
      const months = [
        { value: '01', name: 'January' },
        { value: '02', name: 'February' },
        { value: '03', name: 'March' },
        { value: '04', name: 'April' },
        { value: '05', name: 'May' },
        { value: '06', name: 'June' },
        { value: '07', name: 'July' },
        { value: '08', name: 'August' },
        { value: '09', name: 'September' },
        { value: '10', name: 'October' },
        { value: '11', name: 'November' },
        { value: '12', name: 'December' },
      ];
  
      const currentYear = new Date().getFullYear();
      const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i); // Last 100 years
  
      const monthDropdown = `
        <select class="form-control d-inline-block me-2" id="filterMonthSelect">
          ${months.map(month => `<option value="${month.value}">${month.name}</option>`).join('')}
        </select>
      `;
  
      const yearDropdown = `
        <select class="form-control d-inline-block me-2" id="filterYearSelect">
          ${yearOptions.map(year => `<option value="${year}">${year}</option>`).join('')}
        </select>
      `;
  
      filterInput.innerHTML = `
        ${monthDropdown}
        ${yearDropdown}
        <button class="btn btn-primary" onclick="applyFilter('month')">OK</button>
      `;
    } else if (filterType === 'year') {
      // Year filter
      const currentYear = new Date().getFullYear();
      const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i); // Last 100 years
  
      const yearDropdown = `
        <select class="form-control d-inline-block me-2" id="filterYear">
          ${yearOptions.map(year => `<option value="${year}">${year}</option>`).join('')}
        </select>
        <button class="btn btn-primary" onclick="applyFilter('year')">OK</button>
      `;
  
      filterInput.innerHTML = yearDropdown;
    }
    // Add the "Clear Filters" button
    filterInput.innerHTML += `
        <button class="btn btn-warning ms-2" onclick="loadExpenses()">Clear Filters</button>
    `;
  }
  
// Apply filters and reload expenses
function applyFilter(filterType) {
    let queryParams = '';
    if (filterType === 'date') {
      const date = document.getElementById('filterDate').value;
      if (!date) {
        alert('Please select a valid date.');
        return;
      }
  
      // Log the selected date to the console for debugging
      console.log("Selected date:", date); // Outputs the date in YYYY-MM-DD format
  
      queryParams = `?date=${new Date(date).toISOString().split('T')[0]}`;


      console.log("Query parameters being sent:", queryParams);

    } else if (filterType === 'month') {
      const selectedMonth = document.getElementById('filterMonthSelect').value;
      const selectedYear = document.getElementById('filterYearSelect').value;
  
      if (!selectedMonth || !selectedYear) {
        alert('Please select both a month and a year.');
        return;
      }
      queryParams = `?month=${selectedYear}-${selectedMonth}`;

    } else if (filterType === 'year') {
      const year = document.getElementById('filterYear').value;
      if (!year) {
        alert('Please select a valid year.');
        return;
      }
      queryParams = `?year=${year}`;

    }
  
    loadExpenses(queryParams); // Reload expenses with applied filters
  }
  
  
  
  // Load all expenses on page load
  document.addEventListener('DOMContentLoaded', () => loadExpenses());
  