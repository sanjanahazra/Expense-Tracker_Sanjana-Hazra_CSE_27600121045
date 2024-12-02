// Fetch expenses and generate analytics
async function loadAnalytics() {
    try {
      const response = await fetch('http://localhost:5000/api/expenses'); // Assuming you have a REST endpoint for fetching expenses
      const expenses = await response.json();
  
      // Calculate total expenses and category breakdown
      let totalExpenses = 0;
      const categoryData = {};
  
      expenses.forEach(expense => {
        totalExpenses += expense.amount;
  
        // Breakdown by category
        if (categoryData[expense.category]) {
          categoryData[expense.category] += expense.amount;
        } else {
          categoryData[expense.category] = expense.amount;
        }
      });
  
      // Display total expenses
      document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
  
      // Display category breakdown
      const categoryList = document.getElementById('category-list');
      categoryList.innerHTML = '';
      for (const [category, amount] of Object.entries(categoryData)) {
        const listItem = document.createElement('li');
        listItem.textContent = `${category}: $${amount.toFixed(2)}`;
        categoryList.appendChild(listItem);
      }
  
      // Generate pie chart using Chart.js
      const ctx = document.getElementById('expenseChart').getContext('2d');
      const labels = Object.keys(categoryData);
      const data = Object.values(categoryData);
      
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Expenses by Category',
            data: data,
            backgroundColor: [
              '#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#F0F033', '#33F0F0'
            ],
            borderColor: '#fff',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,  // Ensures the chart resizes dynamically
          maintainAspectRatio: false, // Allows the aspect ratio to be changed
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(tooltipItem) {
                  return `${tooltipItem.label}: $${tooltipItem.raw.toFixed(2)}`;
                }
              }
            }
          }
          
        }
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  }
  
  // Load analytics when the page loads
  document.addEventListener('DOMContentLoaded', loadAnalytics);
  