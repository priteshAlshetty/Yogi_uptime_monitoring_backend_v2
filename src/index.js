
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path"); // Import path module
const { swaggerUi, swaggerSpec } = require('../swagger');
const dashboardRoutes = require("./routes/dashboard.routes.js");
const dashboardNewRoutes = require("./routes/dashboard.newRoutes.js")
dotenv.config();
// const pages = require("./routes/pages.routes.js");
//latest version 03062026
const app = express();

app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

const port = process.env.SERVE_PORT || 3000;

// Serve static files from the 'public' folder
// app.use(express.static(path.join(__dirname, 'public')));

// Sample route
app.get("/", (req, res) => {
    res.send("Hello, World!");
});

// Use your routes
app.use("/dashboard", dashboardRoutes);
app.use("/dashboard", dashboardNewRoutes)
// app.use("/pages", pages);

// Start the server
app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
