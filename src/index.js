
const express = require('express');
const app = express();
const port = process.env.port || 3000; // Define port number

// Import routes from the app.js (or index.js) file
const userRoutes = require('./App');

// Use routes
app.use(userRoutes);

// Start the server
app.listen(port, () => console.log("Server is running on port " + port));
