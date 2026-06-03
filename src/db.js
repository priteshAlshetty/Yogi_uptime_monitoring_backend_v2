const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'yogi_uptime',
    port: process.env.DB_PORT || 3311, //
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    timezone: '+05:30',
});

(async () => {
    try{
        const connection = await pool.getConnection();
        console.log("Connected to MySQL Database - yogi_uptime");
        connection.release();
    } catch (err) {
        console.error("Failed to connect to MySQL Database: ", err.message);
        process.exit(1); // exit if DB is critical
    }
})();

module.exports = pool;

// msg.machine_id= "KHAL_MIXING_01";
// msg.numeric_id = 1;
// msg.insertTrigger = false;