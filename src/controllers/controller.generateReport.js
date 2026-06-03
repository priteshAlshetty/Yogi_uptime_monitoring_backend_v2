const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

/**
 * Create an Excel file with raw_data and summary sheets
 * @param {Object} jsonData - JSON containing raw_data and summary
 * @param {String} outputPath - Output path for the Excel file
 */

async function createUptimeExcel(jsonData, outputPath = "reports") {
	const workbook = new ExcelJS.Workbook();

	
	const now = new Date();
	const timestamp = now
		.toLocaleString("en-GB", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		})
		.replace(/[/,: ]/g, "_"); // 11_06_2025_14_32_10
	const fileName = `report_${timestamp}.xlsx`;
	const folderPath = path.join(__dirname, outputPath);
	const filePath = path.join(folderPath, fileName);

	// Ensure reports folder exists
	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath, { recursive: true });
	}

	//=========== Utility function to style header row  =========================
	const formatHeader = (row) => {
		row.eachCell((cell) => {
			cell.font = { bold: true };
			cell.alignment = { vertical: "middle", horizontal: "center" };
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FFDCE6F1" },
			};
			cell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};
		});
	};

	// ========== Sheet 1: Raw Data ==========
	const rawSheet = workbook.addWorksheet("Raw Data");
	const rawColumns = [
		{ header: "Sr No", key: "sr_no", width: 8 },
		{ header: "Machine ID", key: "ID", width: 10 },
		{ header: "Machine Name", key: "machine_id", width: 20 },
		{ header: "Start Time", key: "start_time", width: 22 },
		{ header: "Stop Time", key: "stop_time", width: 22 },
		{ header: "DateTime Logged", key: "dateTime", width: 22 },
		{ header: "Uptime (ms)", key: "uptime_ms", width: 14 },
		{ header: "Uptime (sec)", key: "uptime_sec", width: 14 },
		{ header: "Uptime (hr)", key: "uptime_hr", width: 14 },
	];
	rawSheet.columns = rawColumns;
	formatHeader(rawSheet.getRow(1));

	jsonData.raw_data.forEach((item) => rawSheet.addRow(item));

	// ========== Sheet 2: Summary ==========
	const summarySheet = workbook.addWorksheet("Summary");
	const summaryColumns = [
		{ header: "Machine Name", key: "machine_id", width: 20 },
		{ header: "Total Uptime (ms)", key: "total_uptime_ms", width: 20 },
		{ header: "Total Uptime (sec)", key: "total_uptime_sec", width: 20 },
		{ header: "Total Uptime (hr)", key: "total_uptime_hr", width: 20 },
	];
	summarySheet.columns = summaryColumns;
	formatHeader(summarySheet.getRow(1));

	jsonData.summary.forEach((item) => summarySheet.addRow(item));

	//-------------save----------------------------------
	await workbook.xlsx.writeFile(filePath);
	console.log(`✅ Excel file created at: ${filePath}`);
	return filePath;
}



module.exports = { createUptimeExcel };
