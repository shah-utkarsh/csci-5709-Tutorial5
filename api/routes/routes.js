const path = require('path');
const express = require('express');
const fs = require('fs');
const usersObj = require('../database/users');

const router = express.Router();

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
        return res.status(200).json({
            message: "Users retrived",
            success: true,
            users: usersObj
        });
    }
    catch (err) {
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }

});

// POST API to create a new user
router.post('/add', (req, res) => {
    const id = generateUniqueUserID();
    let newUser = {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        id: id // Generate a unique ID
    };

    usersObj.push(newUser);
    const usersFilePath = path.join(__dirname, '..', 'database', 'users.js');

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
});

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

        const usersFilePath = path.join(__dirname, '..', 'database', 'users.js');

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
function generateUniqueUserID() {
    return Math.random().toString(36).substr(2, 10);
}

module.exports = router;