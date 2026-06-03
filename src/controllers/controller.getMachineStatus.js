const db = require("../db");

async function getStatus() {
	try{
const [rows] = await db.query(/*sql*/`
		SELECT DISTINCT(main.ID), main.Event,main.machine_id, DATE_FORMAT(main.Timestamp, '%Y-%m-%d::%H:%i:%s') AS Timestamp
    FROM on_off_logging main
    JOIN (
        SELECT ID, MAX(Timestamp) AS MaxTimestamp
        FROM on_off_logging
        GROUP BY ID
    ) latest 
    ON main.ID = latest.ID AND main.Timestamp = latest.MaxTimestamp;`);

	if(rows.length>0){
		return { err: null, data: rows };
	}else{
		return { err: "No data found", data: null };		
	}
	}catch(error){
		return { err:error, data: null };	
	}
	
}

function calculateUptimeSql(targateDate) {
	targetDate = targetDate ? targetDate : "2025-02-10"; //if null use default

	const query = /*sql*/ `DELETE FROM uptime WHERE Date = '${targetDate}';
    INSERT INTO uptime (ID, Date, UPTIME, DOWNTIME)
    SELECT 
        final_calculations.ID,
        final_calculations.EventDate AS Date,
        final_calculations.UPTIME_Hours,
        final_calculations.DOWNTIME_Hours
    FROM (
        SELECT 
            on_off_logging_subquery.ID,
            on_off_logging_subquery.EventDate,
            SUM(TIMESTAMPDIFF(SECOND, on_off_logging_subquery.ON_Time, on_off_logging_subquery.OFF_Time)) / 3600 AS UPTIME_Hours,
            20 - SUM(TIMESTAMPDIFF(SECOND, on_off_logging_subquery.ON_Time, on_off_logging_subquery.OFF_Time)) / 3600 AS DOWNTIME_Hours
        FROM (
            SELECT 
                on_off_logging.ID,
                on_off_logging.Timestamp AS ON_Time,
                COALESCE(
                    on_off_logging2.Timestamp, 
                    DATE_ADD(DATE(on_off_logging.Timestamp), INTERVAL 23 HOUR)
                ) AS OFF_Time,
                DATE(on_off_logging.Timestamp) AS EventDate
            FROM on_off_logging
            LEFT JOIN on_off_logging AS on_off_logging2 
                ON on_off_logging.ID = on_off_logging2.ID 
                AND on_off_logging2.EVENT = 'OFF' 
                AND on_off_logging2.Timestamp > on_off_logging.Timestamp
            WHERE on_off_logging.EVENT = 'ON'
                AND DATE(on_off_logging.Timestamp) = '${targetDate}'
            
            UNION ALL
            
            SELECT 
                on_off_logging.ID,
                DATE_ADD(DATE(on_off_logging.Timestamp), INTERVAL 7 HOUR) AS ON_Time,
                on_off_logging.Timestamp AS OFF_Time,
                DATE(on_off_logging.Timestamp) AS EventDate
            FROM on_off_logging
            WHERE on_off_logging.EVENT = 'OFF'
                AND NOT EXISTS (
                    SELECT 1
                    FROM on_off_logging AS on_off_logging2
                    WHERE on_off_logging2.ID = on_off_logging.ID
                        AND on_off_logging2.EVENT = 'ON'
                        AND on_off_logging2.Timestamp < on_off_logging.Timestamp
                )
        ) AS on_off_logging_subquery
        GROUP BY on_off_logging_subquery.ID, on_off_logging_subquery.EventDate
    ) AS final_calculations;
    `;

	return new Promise((resolve, reject) => {
		db.query(query, (err, result) => {
			if (err) {
				console.error(err);
				return resolve({ err, result: null }); // Resolve with error for handling
			}
			resolve({ err: null, result });
		});
	});
}

async function fetchAndProcessData(dateString) {
	const data = await getData(`SELECT * FROM on_off_logging 
WHERE Timestamp >= '${dateString} 00:00:00' 
AND Timestamp < '${dateString} 23:59:59';
`);

	if (data.err) {
		console.error("Database error:", data.err);
		return null; // Return null on error
	}

	if (!Array.isArray(data.result)) {
		console.error("Data is not an array:", data);
		return null; // Return null if data is not an array
	}

	const plainData = data.result.map((row) => ({
		...row,
		Timestamp: new Date(
			new Date(row.Timestamp).getTime() + 5.5 * 60 * 60 * 1000,
		), // Convert UTC to IST
	}));
	return plainData; // Return the processed data
}

function processPlainData(plainData) {
	// Step 1: Sort by timestamp in ascending order
	plainData.sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));

	// Step 2: Find the first 'ON' event for each ID
	const firstOnEventMap = new Map(); // Stores first 'ON' event timestamp for each ID
	const validData = [];

	for (const row of plainData) {
		if (row.Event === "ON" && !firstOnEventMap.has(row.ID)) {
			firstOnEventMap.set(row.ID, row.Timestamp);
		}
	}

	// Step 3 & 4: Filter the data based on the first 'ON' event
	const filteredData = plainData.filter((row) => {
		if (!firstOnEventMap.has(row.ID)) {
			// If no 'ON' event found for an ID, drop all 'OFF' events for that ID
			return false;
		}
		// Keep only events that occur after or at the first 'ON' event for that ID
		return new Date(row.Timestamp) >= new Date(firstOnEventMap.get(row.ID));
	});

	return filteredData;
}

function calculateUptime(filteredData) {
	const idUptimeMap = new Map(); // Stores total uptime for each ID

	// Step 1: Initialize all 20 IDs with zero uptime
	for (let i = 1; i <= 20; i++) {
		idUptimeMap.set(i, 0);
	}

	// Step 2: Group events by ID and process ON-OFF pairs
	const idEventMap = new Map();

	for (const row of filteredData) {
		if (!idEventMap.has(row.ID)) {
			idEventMap.set(row.ID, []);
		}
		idEventMap.get(row.ID).push(row);
	}

	// Step 3: Calculate uptime for each ID
	idEventMap.forEach((events, id) => {
		let totalUptime = 0;
		let lastOnTime = null;

		for (const event of events) {
			if (event.Event === "ON") {
				lastOnTime = new Date(event.Timestamp);
			} else if (event.Event === "OFF" && lastOnTime) {
				const offTime = new Date(event.Timestamp);
				totalUptime += (offTime - lastOnTime) / 3600000; // Convert ms to hours
				lastOnTime = null; // Reset after a valid ON-OFF pair
			}
		}

		// Store uptime in hours (float value rounded to 4 decimal places)
		idUptimeMap.set(id, parseFloat(totalUptime.toFixed(4)));
	});

	// Step 4: Return the array of JSON objects
	return Array.from(idUptimeMap, ([ID, total_uptime]) => ({
		ID,
		total_uptime,
	}));
}

async function getDailyUptime(dateString) {
	const plainData = await fetchAndProcessData(dateString);
	if (!plainData) {
		return null;
	}
	const filteredData = processPlainData(plainData);
	const uptime = calculateUptime(filteredData);
	return uptime;
}

async function getUptimeByDate(date) {
	const [rows] = await db.query(
		`SELECT * FROM uptime WHERE DATE(dateTime) = '${date}'`,
	);

	const [rows1] = await db.query(/*sql*/ `
	SELECT 
    	machine_id,
    	SUM(uptime_hr) AS total_uptime_hr,
    	SUM(uptime_ms) AS total_uptime_ms,
    	SUM(uptime_sec) AS total_uptime_sec
	FROM 
    	uptime
	WHERE 
		DATE(dateTime) = '${date}'
	GROUP BY 
		machine_id;
`);

		if(rows.length>0 && rows1.length>0){
			const obj={
				raw_data:rows,
				summary: rows1
			}
			return obj;
		}else{
			return null;
		}
}

module.exports = { getStatus, getDailyUptime, getUptimeByDate };
