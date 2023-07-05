const express = require('express');
const path = require('path');
const app = express();

const userRoute = require('./api/routes/routes');

app.use(express.json());

app.use("/", userRoute);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Not found'
    });
});

module.exports = app;