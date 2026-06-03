const express = require('express');
const {getDailyData, getWeeklyData, getMonthlyData, getYearlyData } = require('../controllers/controller.allData');
const {createExcelDaily, createExcelWeekly, createExcelMonthly, createExcelYearly} = require('../controllers/controller.allReport');
const dayjs = require("dayjs");
const router = express.Router()

// API route to get daily data.
router.post("/uptimebydate/getdata", async (req, res) => {
    try{
        const date = req.body.date;

        if(!date){
            return res.status(400).json({
                errMsg : "Missing required parameter--> date",

            });
        } 
        if(typeof date !== 'string') {
            return res.status(400).json({error: "Date must be in strings format YYYY-MM-DD"});
        } 
        if(!dayjs(date, "YYYY-MM-DD", true).isValid()){
            return res.status(400).json({error : "Invalid date format. Use YYYY-MM-DD format for date."});
        }
        if (dayjs(date).isAfter(dayjs())) {
            return res.status(404).json({ error: "No data available for future dates" });
        }

        const uptimeDaily = await getDailyData(date);
        if(!uptimeDaily || uptimeDaily.length === 0){
            return res.status(404).json({error: `No data found for date: ${date}`});
        }

        return res.status(200).json(uptimeDaily);

    } catch(error){
            console.error("Error in /uptimebydate/getdata: ", error);
            res.status(500).json({
                error: "Internal server error",
                message: error.message,
                stack: error.stack,
                location: "/uptimebydate/getdata"
            });
        
    }
});

// API route to generate daily excel report.
router.post("/uptimebydate/report", async (req, res) => {
    try{
        const date = req.body.date;

        if(!date){
            
            return res.status(400).json({
                errMsg: "Missing required parameter--> date",
            });
        }
        if(typeof date !== 'string') {
            return res.status(400).json({error: "Date must be in string format YYYY-MM-DD"});
        } 
        if(!dayjs(date, "YYYY-MM-DD", true).isValid()){
            return res.status(400).json({error: "Invalid date format. Expected YYYY-MM-DD format for date."})
        }
        if (dayjs(date).isAfter(dayjs())) {
            return res.status(404).json({ error: "No data available for future dates" });
        }

        const uptimeDaily = await getDailyData(date);
        if(!uptimeDaily || uptimeDaily.length === 0){
            return res.status(404).json({error: `No data found for date: ${date}`});
        }

        const filepath = await createExcelDaily(date);

        return res.download(filepath, "daily_report.xlsx", (err) => {
            if(err){
                console.error("Error sending file: ", err);
                if(!res.headersSent){
                    return res.status(500).send("Failed to download Excel file");
                }
            }
        });

    } catch(error){
        console.error("Error in /uptimebydate/report: ", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
            stack: error.stack,
            location: "/uptimebydate/report"
        });
    
    }
});

// API route to get weekly data.
router.post("/uptimebyweek/getdata", async (req, res) => {
    try {
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;

        if (!startDate && !endDate) return res.status(400).json({ error: "Missing required parameters: startDate and endDate" });
        if(!startDate) return res.status(400).json({error: "Missing start date --> startDate"});
        if(!endDate) return res.status(400).json({error : "Missing end date ---> endDate "});
        if(!dayjs(startDate, "YYYY-MM-DD", true).isValid()){
            return res.status(400).json({error:  "Invalid Start Date. Expected YYYY-MM-DD format for start date."})
        }
        if(typeof startDate !== 'string' || typeof endDate !== 'string') {
            return res.status(400).json({error: "startDate and endDate must be strings in YYYY-MM-DD format"});
        }
        if(!dayjs(endDate, "YYYY-MM-DD", true).isValid()){
            return res.status(400).json({error: "Invalid End Date. Expected YYYY-MM-DD format for end date."})
        }
        if (dayjs(startDate).isAfter(dayjs()) || dayjs(endDate).isAfter(dayjs())) {
            return res.status(404).json({ error: "No data available for future dates" });
        }
        
        const uptimeWeekly = await getWeeklyData(startDate, endDate);
        if (!uptimeWeekly || uptimeWeekly.length === 0 ) {
            return res.status(404).json({ error: `No data found for date range: ${startDate} to ${endDate}` });
        }

        return res.status(200).json(uptimeWeekly);

    } catch (error) {
        console.error("Error in /uptimebyweek/getdata:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
            stack: error.stack,
            location: "/uptimebyweek/getdata"
        });
    }
});

// API route to generate weekly excel report.
router.post("/uptimebyweek/report", async (req, res) => {
    try {
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;

        if (!startDate && !endDate) return res.status(400).json({ error: "Missing required parameters: startDate and endDate" });
        if(!startDate) return res.status(400).json({error: "Missing start date --> startDate"});
        if(!endDate) return res.status(400).json({error : "Missing end date ---> endDate "});
        if(!dayjs(startDate, "YYYY-MM-DD", true).isValid()){
            return res.status(400).json({error: "Invalid Start Date. Expected YYYY-MM-DD format for start date."})
        }
        if(typeof startDate !== 'string' || typeof endDate !== 'string') {
            return res.status(400).json({error: "startDate and endDate must be strings in YYYY-MM-DD format"});
        }
        if(!dayjs(endDate, "YYYY-MM-DD", true).isValid()){
            return res.status(400).json({error: "Invalid End Date. Expected YYYY-MM-DD format for end date."})
        }
        if (dayjs(startDate).isAfter(dayjs()) || dayjs(endDate).isAfter(dayjs())) {
            return res.status(404).json({ error: "No data available for future dates" });
        }
        const uptimeWeekly = await getWeeklyData(startDate, endDate);
        if (!uptimeWeekly || uptimeWeekly.length === 0) {
            return res.status(404).json({ error: `No data found for date range: ${startDate} to ${endDate}` });
        }

        const filepath = await createExcelWeekly(startDate, endDate);

        return res.download(filepath, "weekly_report.xlsx", (err) => {
            if (err) {
                console.error("Error sending file:", err);
                if (!res.headersSent) {
                    return res.status(500).send("Failed to download Excel file");
                }
            }
        });
    } catch (error) {
        console.error("Error in /uptimebyweek/report:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
            stack: error.stack,
            location: "/uptimebyweek/report"
        });
    }
});

// API route to get Monthly Data
router.post("/uptimebymonth/getdata", async(req, res) => {
    try{
        const month = req.body.month;

        if(!month){
            return res.status(400).json({
                errMsg : "Missing required parameter --> month"
            });
        }
        if(typeof month !== 'string'){
            return res.status(400).json({error : "Month should be in string format YYYY-MM "})
        }
        if(month.length !== 7 || month[4] !== '-'){
            return res.status(400).json({
                error: "Month should be in string format YYYY-MM "
            })
        }

        const uptimeMonthly = await getMonthlyData(month);
        if(!uptimeMonthly || uptimeMonthly.length === 0){
            return res.status(404).json({error : `No data found for give month: ${month}`})
        }

        return res.status(200).json(uptimeMonthly);
    } catch(error){
        console.error("Error in /uptimebymonth/getdata: ", error);
        res.status(500).json({
            error : "Internal Server Error",
            message : error.message,
            stack : error.stack,
            location : "/uptimebymonth/getdata"
        });
    }
});

// API route to generate monthly excel report
router.post("/uptimebymonth/report", async (req, res) => {
    try{
        const month = req.body.month;

        if(!month){
            
            return res.status(400).json({
                errMsg: "Missing required parameter--> month",
            });
        }
        if(typeof month !== 'string') {
            return res.status(400).json({error: "the month should be in string format."});
        } 
        if(month.length !== 7 || month[4] !== '-'){
            return res.status(400).json({
                error: "Month should be in string format YYYY-MM "
            })
        }
        const uptimeMonthly = await getMonthlyData(month);
        if(!uptimeMonthly || uptimeMonthly.length === 0){
            return res.status(404).json({error: `No data found for month: ${month}`});
        }

        const filepath = await createExcelMonthly(month);

        return res.download(filepath, "monthly_report.xlsx", (err) => {
            if(err){
                console.error("Error sending file: ", err);
                if(!res.headersSent){
                    return res.status(500).send("Failed to download Excel file");
                }
            }
        });

    } catch(error){
        console.error("Error in /uptimebymonth/report: ", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
            stack: error.stack,
            location: "/uptimebymonth/report"
        });
    
    }
});

// API route to get Yearly Data
router.post('/uptimebyyear/getdata', async (req, res) => {
    try{
        const year = req.body.year;

        if(!year){
            return res.status(400).json({
                errMsg : "Missing required parameter--> year YYYY",
            });
        }
        if(typeof year !== 'string'){
            return res.status(400).json({error: "year should be in string format YYYY"});
        }
        if(year.length !== 4){
            return res.status(400).json({errMsg: "Year must have four characters as YYYY"});
        }

        const uptimeYearly = await getYearlyData(year);

        if(!uptimeYearly || uptimeYearly.length === 0){
            return res.status(404).json({error: "No data found for the given year: ", year});
        }

        return res.status(200).json(uptimeYearly);

    } catch(error){
        console.error("Error in /uptimebyyear/getdata: ", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
            stack: error.stack,
            location: "/uptimebyyear/getdata"
        });
    }
}) 

// API route to generate yearly excel
router.post('/uptimebyyear/report', async(req, res) => {
    try{
        const year = req.body.year;

        if(!year){
            return res.status(400).json({errMsg : "Missing required parameter year YYYY"});
        }
        if(typeof year !== 'string'){
            return res.status(400).json({errMsg: "Year should be in string format YYYY"});
        }
        if(year.length !== 4){
            return res.status(400).json({errMsg: "Year must have four characters YYYY"});
        }

        const uptimeYearly = await getYearlyData(year);

        if(!uptimeYearly || uptimeYearly.length === 0){
            return res.status(400).json({error: `No data found for year: ${year}`});
        }

        const filePath = await createExcelYearly(year);

        return res.download(filePath, "yearly_report_.xlsx", (err) => {
            console.error("Error sending file: ", err);
            if(!res.headersSent){
                return res.status(500).send("Failed to download Excel File");
            }
        })
    } catch(error){
        console.error("Error in /uptimebyyear/report: ", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
            stack: error.stack,
            location: "/uptimebyyear/report"
        });
    };
});
module.exports = router;