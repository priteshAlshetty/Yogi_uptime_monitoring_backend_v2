const db = require('../db');  

//convert decimal to hours: HH:MM format
function convertToClockHr(uptime){
    const hours = Math.floor(uptime);
    const minutes = Math.round((uptime - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Daily data for API response
async function getDailyData(date){
    try{
        const [rows1] = await db.query(
            `SELECT machine_id, 
                SUM(uptime_sec) as total_uptime_sec,
                SUM(uptime_hr) as total_uptime_hr
            FROM uptime
            WHERE DATE(dateTime) = ?
            GROUP BY machine_id;`, [date]
         );

         if (!rows1.length) return null;

         const dailyData = rows1.map(item => {
            const uptime_min = Math.floor(item.total_uptime_sec /60);
            const uptime_hr = parseFloat((uptime_min / 60).toFixed(2));
            const total_hr = convertToClockHr(uptime_hr);

            return {
                Machine_Id : item.machine_id,
                Uptime_min: uptime_min,
                Uptime_hr: uptime_hr,
                Total_hr: total_hr,
            };
         });

         return {dailyData};
    } catch (error){
        console.error(`[getUptimeByDate] Error for date: ${date}`, date);
        throw{
            location: `controller.getMachineStatus.js --> getUptimeByDate()`,
            message: error.message,
            stack: error.stack
        };
    }
};

//Daily data for Excel report
async function getReportByDate(date){
    try{
        const [rows1] = await db.query(
            `SELECT machine_id, 
                SUM(uptime_sec) as total_uptime_sec,
                SUM(uptime_hr) as total_uptime_hr
            FROM uptime
            WHERE DATE(dateTime) = ?
            GROUP BY machine_id;`, [date]
         );

         if (!rows1.length) return null;

         const formatted = rows1.map(item => {
            const uptime_min = Math.floor(item.total_uptime_sec /60);
            const uptime_hr = parseFloat((uptime_min / 60).toFixed(2));
            const total_hr = convertToClockHr(uptime_hr);

            return {
                Machine_Id : item.machine_id,
                Uptime_min: uptime_min,
                Uptime_hr: uptime_hr,
                Total_hr: total_hr,
            };
         });

         return formatted;
    } catch (error){
        console.error(`[getUptimeByDate] Error for date: ${date}`, date);
        throw{
            location: `controller.getMachineStatus.js --> getUptimeByDate()`,
            message: error.message,
            stack: error.stack
        };
    }
};

// Weekly data for API response
async function getWeeklyData(startDate, endDate){
    try{
        const weeklyData ={};
        const Total = {};
        let current = new Date(startDate);
        const last = new Date(endDate)

        while(current <= last){
            const yyyy = current.getFullYear();
            const mm = String(current.getMonth() + 1).padStart(2, '0');
            const dd = String(current.getDate()).padStart(2, '0')
            const date =`${yyyy}-${mm}-${dd}`;

            const [rows] = await db.query(
            `SELECT machine_id, ROUND(SUM(uptime_hr), 2) as total_uptime_hr FROM uptime
            WHERE DATE(dateTime) = ?
            GROUP BY machine_id`, [date]
            );

            weeklyData[date] = rows.reduce((acc, row) => {
                acc[row.machine_id] = row.total_uptime_hr;
            
                if(!Total[row.machine_id]){
                    Total[row.machine_id] = 0;
                }
                Total[row.machine_id] += row.total_uptime_hr;

                return acc;
            }, {});
        

            current.setDate(current.getDate() + 1)
        }

        for (const machine in Total){
            Total[machine] = parseFloat(Total[machine].toFixed(2));
        }
        weeklyData['Total'] = Total;
        
        return {weeklyData};            

    } catch(error){
        console.error(`[getUptimeByWeek] Error from ${startDate} to ${endDate}`, error);
        throw {
            location: 'controller.getMachineStatus.js --> getUptimeByWeek()',
            message: error.message,
            stack: error.stack
         };
    }
};

// Weekly data for Excel report
async function getReportByWeek(startDate, endDate){

    try{
        const [rows] = await db.query(
            `SELECT
                machine_id,
                DATE_FORMAT(dateTime, '%Y-%m-%d') as Date,
                ROUND(SUM(uptime_hr), 2) as total_uptime_hr
            FROM uptime
            WHERE DATE(dateTime) BETWEEN ? AND ?
            GROUP BY machine_id, Date;`, [startDate, endDate]
        );

        //get all dates in range
        function getDateRange(start, end){
            const dates = [];
            let current = new Date(start);
            const last = new Date(end);
            while (current <= last) {
                const yyyy = current.getFullYear();
                const mm = String(current.getMonth() + 1).padStart(2, '0');
                const dd = String(current.getDate()).padStart(2, '0');

                dates.push(`${yyyy}-${mm}-${dd}`);

                current.setDate(current.getDate() + 1);           
            }
            return dates;
        };

        const allDates = getDateRange(startDate, endDate);
        //get all unique machine id
        const machines = [...new Set(rows.map(r => r.machine_id))];
       
        // Create a lookup map for quick access { machine_id: { date: uptime } }
        const uptimeMap = {};
        for (const {machine_id, Date, total_uptime_hr} of rows) {
            if(!uptimeMap[machine_id]) uptimeMap[machine_id] = {};
            uptimeMap[machine_id][Date] = total_uptime_hr;
        };

        // Build the full data with zeros for missing dates
        const result = machines.map(machine_id => {
                const uptimes = allDates.map(date => {
                const val = uptimeMap[machine_id]?.[date] ?? 0;
                return Number(val.toFixed(2));
            });
            return {machine_id, uptimes};
        }); 

        //prepare data to add in excel sheet format
        function formatForExcel(result, allDates){
            const headerRow = ['Machine_Name', ...allDates];
            const dataRows = result.map(({machine_id, uptimes}) => [machine_id, ...uptimes]);
            return [headerRow, ...dataRows];
        };
        //return formatForExcel(result, allDates);
        return formatForExcel(result, allDates);

    } catch(error){
        console.error(`[getUptimeByWeek] Error from ${startDate} to ${endDate}`, error);
        throw {
            location: 'controller.getMachineStatus.js --> getUptimeByWeek()',
            message: error.message,
            stack: error.stack
        };
    }
    
};

// Monthly data for API response
async function getMonthlyData(month){
    try{
        let [yyyy, mm] = month.split("-");
        yyyy = Number(yyyy);
        mm = Number(mm);

        const [raw_data] = await db.query(
        `SELECT  machine_id, DATE_FORMAT(dateTime, "%Y-%m-%d") as Date, ROUND(SUM(uptime_hr), 2) as total_uptime_hr
        FROM uptime
        WHERE YEAR(dateTime) = ? AND MONTH(dateTime) = ?
        GROUP BY machine_id, Date
        ORDER BY Date;`, [yyyy, mm]  
        );
        const monthlyData = {};
        const machineSet = new Set();
        const machineTotals = {};
        

        raw_data.forEach(entry => {
            const {machine_id, Date, total_uptime_hr} = entry;

            if(!monthlyData[Date]){
                monthlyData[Date] = {};
            }
            //save uptime
            monthlyData[Date][machine_id] = total_uptime_hr ?? 0;
            //add machine to set
            machineSet.add(machine_id);

            //track totals
            if(!machineTotals[machine_id]){
                machineTotals[machine_id] =0;
            }
            machineTotals[machine_id] += total_uptime_hr ?? 0;

        });

        //add total row
        const totalRow={};
        for(const machine of machineSet){
            const total = machineTotals[machine] ?? 0;
            totalRow[machine] = convertToClockHr(total)
        };

        monthlyData['Total'] = totalRow;
        //console.log(monthlyData);
        return {monthlyData};
    
    } catch(error){
        console.error(`[getMonthlyData] Error for month: ${mm}`);
        throw{
            location: `controller.getMachineStatus.js --> getMonthlyData()`,
            message: error.message,
            stack: error.stack
        };

    }

};

// Monthly data for Excel report
async function getReportbyMonth(month){
    try{
        let [yyyy, mm] = month.split("-");
        yyyy = Number(yyyy);
        mm = Number(mm)

        const [raw_data] = await db.query(
        `SELECT  machine_id, DATE_FORMAT(dateTime, "%Y-%m-%d") as Date, ROUND(SUM(uptime_hr), 2) as total_uptime_hr
        FROM uptime
        WHERE YEAR(dateTime) = ? AND MONTH(dateTime) = ?
        GROUP BY machine_id, Date
        ORDER BY Date;`, [yyyy, mm]  
        );

        const rows =[];
        const machineSet = new Set();
        const dateMap = {};

        raw_data.forEach(entry => {
            const {machine_id, Date, total_uptime_hr} = entry;

            if(!dateMap[Date]){
                dateMap[Date] = {};
            }

            dateMap[Date][machine_id] = total_uptime_hr ?? 0;
            machineSet.add(machine_id);
        });
        
        const machines = Array.from(machineSet).sort();
        const headers = ["Date", ...machines];
        rows.push(headers);
    
        //create rows in date order
        const sortedDates = Object.keys(dateMap).sort();
        
        //Initialize total
        const machineTotals = {};
        machines.forEach(machine => {
            machineTotals[machine] = 0;
        });

        //create rows in date order
        sortedDates.forEach(date => {
            const row = [date];
            machines.forEach(machine => {
                const val = dateMap[date][machine] ?? 0;
                row.push(val);
                machineTotals[machine] += val
            });
            rows.push(row);
        });
        
        //add totals row
        const totalRow = ["Total (HH:MM)"];
        machines.forEach(machine => {
            const hr = machineTotals[machine].toFixed(2);
            totalRow.push(convertToClockHr(hr));
        });
        rows.push(totalRow)

        return rows;
    
    } catch(error){
        console.error(`[getMonthlyData] Error for month: ${mm}`);
        throw{
            location: `controller.getMachineStatus.js --> getMonthlyData()`,
            message: error.message,
            stack: error.stack
        };

    }

};

// Yearly data for API response
async function getYearlyData(year){
    try{
        const [rows] = await db.query(
        `SELECT machine_id, 
                DATE_FORMAT(dateTime, '%Y') AS Year, 
                ROUND(SUM(uptime_sec) / 60, 2) AS uptime_min,
                ROUND(SUM(uptime_hr), 2) AS uptime_hr
        FROM uptime
        WHERE YEAR(dateTime) = ?
        GROUP BY machine_id, Year
        ORDER BY machine_id;`, [year]
        );

        if (!rows || rows.length === 0) {
        console.warn(`No uptime data found for year: ${year}`);
        return [];
        }
        const yearlyData = rows.map((item) => {
            const Total_Hr = convertToClockHr(item.uptime_hr);

            return {
                Machine_Name : item.machine_id,
                Year : item.Year,
                Uptime_Min : item.uptime_min,
                Uptime_Hr : item.uptime_hr,
                Total_Hr : Total_Hr
            }
        })
        return {yearlyData};

    } catch(error){
        console.error("Error fetching yearly data: ", error);
        throw{
            location: `controller.getMachineStatus.js --> getYearyData()`,
            message: error.message,
            stack: error.stack
        };
    }
};

// Get yearly uptime data for all machines
async function getReportByYear(year) {
  try {
    const [rows] = await db.query(
      `SELECT machine_id,
              DATE_FORMAT(dateTime, '%Y') AS Year,
              ROUND(SUM(uptime_sec) / 60, 2) AS uptime_min,
              ROUND(SUM(uptime_hr), 2) AS uptime_hr 
       FROM uptime
       WHERE YEAR(dateTime) = ?
       GROUP BY machine_id, Year
       ORDER BY machine_id;`,
      [year]
    );

    if (!rows || rows.length === 0) {
      console.warn(`No uptime data found for year: ${year}`);
      return [];
    }

        const yearlyData = rows.map((item) => {
            const Total_Hr = convertToClockHr(item.uptime_hr);

            return {
                Machine_Name: item.machine_id,
                Year: item.Year,
                Uptime_Min: item.uptime_min,
                Uptime_Hr: item.uptime_hr,
                Total_Hr: Total_Hr
            }
        })
    
        return yearlyData;

  } catch (error) {
    console.error("Error fetching yearly data:", error);
    throw{
        location: `controller.getMachineStatus.js --> getReportByYear()`,
        message: error.message,
        stack: error.stack
    };
  }
}

module.exports = {
    getDailyData,
    getReportByDate, 
    getWeeklyData, 
    getReportByWeek,
    getMonthlyData,
    getReportbyMonth,
    getYearlyData,
    getReportByYear,

};


