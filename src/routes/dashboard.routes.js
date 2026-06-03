const express = require("express");
const {
	getStatus,
	getDailyUptime,
	getUptimeByDate,
} = require("../controllers/controller.getMachineStatus.js");
const {
	createUptimeExcel,
} = require("../controllers/controller.generateReport.js");

const router = express.Router();

// router.get("/machineStatus", async (req, res) => {

// 	// const query = /*sql*/ `SELECT ID, Event, DATE_FORMAT(Timestamp, '%Y-%m-%d::%H:%i:%s') AS Timestamp
//     // FROM on_off_logging AS outer_table
//     // WHERE Timestamp = (
//     //     SELECT MAX(Timestamp)
//     //     FROM on_off_logging AS inner_table
//     //     WHERE inner_table.ID = outer_table.ID
//     // );`;

// 	// const optimizeQuery = /*sql*/`SELECT main.ID, main.Event, DATE_FORMAT(main.Timestamp, '%Y-%m-%d::%H:%i:%s') AS Timestamp
//     // FROM on_off_logging main
//     // JOIN (
//     //     SELECT ID, MAX(Timestamp) AS MaxTimestamp
//     //     FROM on_off_logging
//     //     GROUP BY ID
//     // ) latest
//     // ON main.ID = latest.ID AND main.Timestamp = latest.MaxTimestamp;`;

// 	// const { err, result } = await getData(optimizeQuery);

//     const result = await getStatus();

// 	if (result.err) {
// 		res.status(500).json({ error: "database connection error ", result });
// 		console.log(result.err);
// 	} else {
// 		res.status(200).json(result);
// 	}
// });

router.get("/machineStatus", async (req, res) => {
	try {
		const result = await getStatus();

		if (result.err) {
			console.error("DB Error:", result.err);
			return res.status(500).json({
				error: "Database connection error",
				detail: result.err,
				data: null,
			});
		}

		return res.status(200).json(result);
	} catch (err) {
		// Handle unexpected code-level errors
		console.error("Unexpected error:", err);
		return res.status(500).json({
			error: "Internal server error",
			detail: err.message || err,
			data: null,
		});
	}
});

// router.get("/calculateuptimeData", async (req, res) => {
// 	const { err, result } = await calculateUptime((targetDate = "2025-02-10"));

// 	if (err) {
// 		res.status(500).json({ error: "database connection error " });
// 		console.log(err);
// 	} else {
// 		res.status(200).json({ result: "success...OK!" });
// 	}
// });

// router.get("/getUptimeData", async (req, res) => {
// 	const uptime = await getDailyUptime("2025-02-16");

// 	if (!uptime) {
// 		res.status(500).json({ error: "database connection error " });
// 		console.log(err1);
// 	} else {
// 		res.status(200).json(uptime);
// 	}
// });

// router.post("/getUptimeData", async (req, res) => {
// 	// Make sure you have express.json() middleware enabled in your app:
// 	// app.use(express.json());
// 	const { dateString } = req.body;
// 	console.log("Received dateString:", dateString);

// 	if (!dateString) {
// 		return res.status(400).json({ error: "dateString is required" });
// 	}

// 	try {
// 		const uptime = await getDailyUptime(dateString);
// 		if (!uptime) {
// 			return res
// 				.status(500)
// 				.json({ error: "Database connection error or no data found" });
// 		}
// 		uptime.forEach((row) => {
// 			// row.id=row.ID;
// 			// row.name=`Machine_${row.ID}`;
// 			// row.uptime=row.total_uptime;
// 			// row.total_time=24;
// 			// row.downtime=(row.total_time)-(row.uptime);
// 			// row.percentage_down=(row.downtime/row.total_time)*100;
// 			row.id = row.ID;
// 			row.name = `Machine_${row.ID}`;
// 			row.uptime = Number(row.total_uptime.toFixed(2));
// 			row.total_time = 24;
// 			row.downtime = Number((row.total_time - row.uptime).toFixed(2));
// 			row.percentage_down = Number(
// 				((row.downtime / row.total_time) * 100).toFixed(2),
// 			);
// 		});
// 		res.status(200).json(uptime);
// 	} catch (err) {
// 		console.error("Error calculating uptime:", err);
// 		res.status(500).json({ error: "An error occurred" });
// 	}
// });

// router.post("/getUptimeByDate", async (req, res) => {
// 	console.log(req.body);
// 	const dateString = req.body.dateString;
// 	console.log(dateString);
// 	res.status(200).json({ result: "success...OK!", date: `${dateString}` });
// });

//new updated route:

router.post("/uptime/getdata", async (req, res) => {
	try {
		const date = req.body.date;

		if (!date) {
			return res.status(400).json({
				errMsg: "Missing required parameter--> date",
			});
		} else {
			const uptime = await getUptimeByDate(date);
			if (!uptime) {
				throw new Error("No data found for the given date: ", date);
			} else {
				res.status(200).json(uptime);
			}
		}
	} catch (error) {
		res.status(500).json({
			errMsg: "Internal server error",
			err: error.message,
			srrStack: error.stack,
			errLocation: "At try-catch block of route /uptime/getdata",
		});
	}
});

router.post("/uptime/report", async (req, res) => {
	try {
		const date = req.body.date;

		if (!date) {
			return res.status(400).json({
				errMsg: "Missing required parameter--> date",
			});
		} else {
			const uptime = await getUptimeByDate(date);

			if (!uptime) {
				throw new Error("No data found for the given date: ", date);
			} else {
				const filepath = await createUptimeExcel(uptime);
				// res.status(200).json({
				// 	uptime,
				//     filepath
				// });
				res.status(200).download(filepath, "report.xlsx", (err) => {
					if (err) {
						console.error("Error sending file:", err);
						res.status(500).send("Failed to download Excel file");
					}
				});
			}
		}
	} catch (error) {
		res.status(500).json({
			errMsg: "Internal server error",
			err: error.message,
			srrStack: error.stack,
			errLocation: "At try-catch block of route /uptime/getdata",
		});
	}
});
module.exports = router;
