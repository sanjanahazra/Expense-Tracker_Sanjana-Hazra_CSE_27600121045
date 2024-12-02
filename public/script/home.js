const token = localStorage.getItem('authToken');

if (!token) {
  // Redirect to sign-in page if the user is not authenticated
  window.location.href = '/signin.html';
} else {
  // Fetch user data or home page content with the JWT token if authenticated
  fetch('/api/protected', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(response => response.json())
  .then(data => {
    // Use data to display user information or home page content
    console.log(data);
  })
  .catch(error => {
    // Handle error if token is invalid or expired
    console.error('Error:', error);
    window.location.href = '/signin.html'; // Redirect to sign-in page
  });
}
