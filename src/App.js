// app.js

const express = require('express');
const usersObj = require('../api/database/users.js');
const { v4: generateUniqueUserID } = require('uuid');
const path = require('path');
const router = express.Router();


router.use(express.json()); // Enable JSON body parsing

//default
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Default response"
  })
})

// GET API to retrieve all users
router.get('/users', (req, res) => {
  try {
    if (!usersObj || !usersObj.length) {
      return res.status(404).json({ success: false, data: "Users not found!" })
    }
  }
  catch (err) {
    return res.status(500).json({
      message: "Internal Server Error"
    })
  }
  return res.status(200).json({
    message: "Users retrived",
    numberOfUsersRetrived: usersObj.length,
    success: true,
    users: usersObj
  });
});

// POST API to create a new user
router.post('/add', (req, res) => {
  let newUser = {
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    id: generateUniqueUserID() // Generate a unique ID
  };

  usersObj.push(newUser);
  const usersFilePath = path.join(__dirname, '..', 'api', 'database', 'users.js');

  console.log("User file path " + usersFilePath)
  fs.writeFile(usersFilePath, 'module.exports = ' + JSON.stringify(usersObj, null, 2), err => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Error adding user", success: false });
    } else {
      res.json({
        message: "User added",
        success: true,
        id: newUser.id // Return the ID of the new user
      });
    }
  });

  res.json({
    message: "User added",
    success: true,
    id: newUser.id
  });
});

const fs = require('fs');

// PUT API to update an existing user
router.put('/update/:id', (req, res) => {
  let userIndex = usersObj.findIndex(user => user.id === req.params.id);

  if (userIndex === -1) {
    res.status(404).json({ message: "User not found", success: false });
  } else if (!req.body.email && !req.body.firstName) {
    // If neither email nor firstName were provided, send a 400 response
    res.status(400).json({ message: "Incorrect request", success: false });
  } else {
    // If at least one field was provided, update the user
    usersObj[userIndex].email = req.body.email || usersObj[userIndex].email;
    usersObj[userIndex].firstName = req.body.firstName || usersObj[userIndex].firstName;
    usersObj[userIndex].lastName = req.body.lastName || usersObj[userIndex].lastName;

    const usersFilePath = path.join(__dirname, '..', 'api', 'database', 'users.js');

    console.log("User file path " + usersFilePath)

    // Write the updated users array to the users.js file
    fs.writeFile(usersFilePath, 'module.exports = ' + JSON.stringify(usersObj, null, 2), err => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating user", success: false });
      } else {
        res.json({
          message: "User updated",
          success: true
        });
      }
    });
  }
});


// GET API to retrieve a single user
router.get('/user/:id', (req, res) => {
  let user = usersObj.find(user => user.id === req.params.id);

  if (!user) {
    res.status(404).json({ message: "User not found", success: false });
  } else {
    res.status(200).json({
      message: "User " + user.firstName + " successfully retrived",
      success: true,
      user: user
    });
  }
});


// catch all wrong routes
router.all("*", (req, res) => {
  const url = req.originalUrl
  res.status(404).json({
    message: "Route not found for url : " + url,
    suggestion: "Check if the url is correct"
  })
})
module.exports = router;
