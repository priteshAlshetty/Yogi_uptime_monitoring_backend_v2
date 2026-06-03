// const express = require("express");
// const path = require("path");  // Import the path module
// const router = express.Router();

// router.get('/login', (req, res) => {
//     // Correct the path to the 'public/index.html' file
//     res.sendFile(path.join(__dirname, '..', 'public', 'index.html')); 
// });

// module.exports = router;

const express = require("express");
const path = require("path"); // Import the path module
const router = express.Router();

router.get('/login', (req, res) => {
    // Serve 'index.html' from the 'public' folder
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

router.get('/home', (req, res) => {
    // Serve 'index.html' from the 'public' folder
    res.sendFile(path.join(__dirname, '..', 'public', 'homepage.html'));
});

router.get('/report', (req, res) => {
    // Serve 'index.html' from the 'public' folder
    res.sendFile(path.join(__dirname, '..', 'public', 'Report.html'));
});



router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validate credentials
    if (username === 'admin' && password === 'admin') {
        // Redirect to /pages/home if credentials are correct
        //res.redirect('/home');
        res.status(200).json({ message: "Login successful", redirect: "/pages/home" });
    } else {
        // Send a 401 status with an error message if credentials are incorrect
        res.status(401).json({ message: "Bad credentials" });
    }
});

module.exports = router;
