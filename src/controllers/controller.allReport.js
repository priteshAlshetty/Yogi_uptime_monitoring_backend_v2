const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const {getReportByDate, getReportByWeek, getReportbyMonth, getReportByYear} = require('./controller.allData');

// Excel Daily report generation.
async function createExcelDaily(date) {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Summary1');

        const outputPath = "reports";
        const fileName = `Daily_report_${date}.xlsx`;
        const folderPath = path.join(__dirname, outputPath);
        const filePath = path.join(folderPath, fileName);

        // Ensure reports folder exists
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Setup header, styles, image etc...
        worksheet.mergeCells('A1:D1');
        worksheet.getCell('A1').value = "YOGI Kanthika Uptime Monitoring : Daily Report";
        worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell('A1').font = { name: 'Calibri', size: 12 };
        worksheet.getCell('A1').font = {bold : true};
        worksheet.getRow(1).height = 19;
        worksheet.getCell('A1').fill = {
          type : 'pattern',
          pattern : 'solid',
          fgColor : { argb : 'FFC6FFC6'}
        }
        worksheet.getCell('A1').border = { bottom: { style: 'thin' } };

        worksheet.getCell('A2').value = `Date : ${date}`;
        worksheet.getCell('A2').alignment = { vertical: 'middle' };
        worksheet.getCell('A2').font = { bold: true };

        worksheet.mergeCells('C2:D2');
        const imageId = workbook.addImage({
            filename: path.join(__dirname, 'logo.jpeg'),
            extension: 'jpeg'
        });
        worksheet.addImage(imageId, {
            tl: { col: 2, row: 1.1 },
            br: { col: 4, row: 2 },
            editAs: 'twoCell',
        });
        worksheet.getRow(2).height = 22;

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

        worksheet.getRow(3).values = ['Machine Name', 'Total Uptime Min', 'Total Uptime Hr', 'Total Uptime HH:MM'];
        worksheet.columns = [
            { key: 'machine_id', width: 20 },
            { key: 'total_uptime_min', width: 20 },
            { key: 'total_uptime_hr', width: 20 },
            { key: 'total_tuptime', width: 20 }
        ];
        formatHeader(worksheet.getRow(3));

        // Fetch data
        const uptimeData = await getReportByDate(date);

        if (!uptimeData || uptimeData.length === 0) {
            console.warn(`No uptime data found for date: ${date}`);
        } else {
            let rowIndex = 4;
            uptimeData.forEach(item => {
                worksheet.getRow(rowIndex).values = [
                    item.Machine_Id,
                    item.Uptime_min,
                    item.Uptime_hr,
                    item.Total_hr
                ];
                rowIndex++;
            });
        }

        for(let rowIndex = 4; rowIndex <= 8; rowIndex++ ){
            const cell = worksheet.getRow(rowIndex).getCell(4);
            cell.alignment = { horizontal : 'right'};
            cell.font = { bold : true };
        }

        const lastRow = 3 + uptimeData.length;
        const bottomRowBorder = worksheet.getRow(lastRow);
        for(let col = 1; col <= 4; col ++){
            bottomRowBorder.getCell(col).border = {
            bottom : {style : 'thin'}
            };
        }   

        await workbook.xlsx.writeFile(filePath);
        console.log(`Excel file created at: ${filePath}`);
        return filePath;

    } catch (error) {
        console.error(`[createExcelDaily] Failed for date ${date}`, error);
        throw {
            location: 'controller.generateReport.js → createExcelDaily()',
            message: error.message,
            stack: error.stack
        };
    }
};

// Excel Weekly report generation
async function createExcelWeekly(startDate, endDate) {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Weekly_Summary');

        const outputPath = "reports";
        const fileName = `weekly_report${startDate}_${endDate}.xlsx`;
        const folderPath = path.join(__dirname, outputPath);
        const filePath = path.join(folderPath, fileName);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Title Row
        worksheet.mergeCells('A1:I1');
        worksheet.getCell('A1').value = "YOGI Kanthika Uptime Monitoring : Weekly Report";
        worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell('A1').font = { name: 'Calibri', size: 12 };
        worksheet.getCell('A1').font = {bold : true};
        worksheet.getRow(1).height = 19;
        worksheet.getCell('A1').fill = {
          type : 'pattern',
          pattern : 'solid',
          fgColor : {argb : 'FFC6FFC6'}
        };
        worksheet.getCell('A1').border = { bottom: { style: 'thin' } };

        // Date Row
        worksheet.mergeCells("A2:B2");
        worksheet.getCell('A2').value = `Date : ${startDate} - ${endDate}`;
        worksheet.getCell('A2').alignment = { vertical: 'middle' };
        worksheet.getCell('A2').font = { bold: true };

        // Logo
        const logoPath = path.join(__dirname, 'logo.jpeg');
        if (fs.existsSync(logoPath)) {
            worksheet.mergeCells('H2:I2');
            const imageId = workbook.addImage({
                filename: logoPath,
                extension: 'jpeg'
            });
            worksheet.addImage(imageId, {
                tl: { col: 7, row: 1.1 },
                br: { col: 9, row: 2 },
                editAs: 'twoCell'
            });
        }

        worksheet.getRow(2).height = 22;
        worksheet.getRow(3).height = 15;

        // Fetch data (array of arrays)
        const weeklyData = await getReportByWeek(startDate, endDate);

        if (!weeklyData || weeklyData.length <= 1) {
            console.warn(`No uptime data found for date: ${startDate} to ${endDate}`);
            return [];
        }

        // Insert Header Row
        const headers = weeklyData[0];
        const dataRows = weeklyData.slice(1);
        const totalColIndex = headers.length + 1;
        const totalColLetter = worksheet.getColumn(totalColIndex).letter;

        const headerRow = worksheet.getRow(3);
        headers.forEach((header, idx) => {
            const cell = headerRow.getCell(idx + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDCE6F1' },
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Insert "Total" header column
        const totalHeaderCell = headerRow.getCell(totalColIndex);
        totalHeaderCell.value = "Total (HH:MM)";
        totalHeaderCell.font = { bold: true };
        totalHeaderCell.alignment = { vertical: 'middle', horizontal: 'center' };
        totalHeaderCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFA726' },
        };
        totalHeaderCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        //  Insert Data Rows + Total Column
        dataRows.forEach((dataRow, rowIdx) => {
            const row = worksheet.getRow(4 + rowIdx);

            dataRow.forEach((val, colIdx) => {
                row.getCell(colIdx + 1).value = val;
            });

            // Total column formula: SUM(date cols)/24
            const rowNumber = row.number;
            const startColLetter = worksheet.getColumn(2).letter; // B
            const endColLetter = worksheet.getColumn(totalColIndex - 1).letter;

            const totalCell = row.getCell(totalColIndex);
            totalCell.value = {
                formula: `SUM(${startColLetter}${rowNumber}:${endColLetter}${rowNumber}) / 24`
            };
            totalCell.numFmt = '[hh]:mm';
            totalCell.font = { bold: true };
        });

        // Adjust Column Widths
        for (let i = 1; i <= totalColIndex; i++) {
            worksheet.getColumn(i).width = (i === 1 || i === totalColIndex) ? 20 : 14;
        }

        // Add bottom border on last data row
        const lastDataRow = 3 + dataRows.length;
        const lastRow = worksheet.getRow(lastDataRow);
        for (let col = 1; col <= totalColIndex; col++) {
            lastRow.getCell(col).border = { bottom: { style: 'thin' } };
        }

        // Save the Excel file
        await workbook.xlsx.writeFile(filePath);
        console.log("Excel report generated at:", filePath);
        return filePath;

    } catch (error) {
        console.error(`[createExcelWeekly] Failed for date range ${startDate} - ${endDate}`, error);
        throw {
            location: 'controller.generateReport.js → createExcelWeekly()',
            message: error.message,
            stack: error.stack
        };
    }
}


// Excel Monthly report generation.
async function createExcelMonthly(month) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Monthly_Data");

    const outputPath = "reports";
    const fileName = `Monthly_uptime_report_${month}.xlsx`;
    const folderPath = path.join(__dirname, outputPath);
    const filePath = path.join(folderPath, fileName);

    // Ensure reports folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Setup header and styling
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = "Yogi Kanthika Uptime Monitoring: Monthly Report";
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical : 'middle' };
    worksheet.getCell('A1').font = { name: 'Calibri', size: 12 };
    worksheet.getCell('A1').font = {bold : true};
    worksheet.getCell('A1').border = { bottom: { style: 'thin' } };
    worksheet.getCell('A1').fill = {
      type : 'pattern',
      pattern : 'solid',
      fgColor : { argb : 'FFC6FFC6' }
    };
    worksheet.getRow(1).height = 19;

    worksheet.mergeCells('A2:B2');
    worksheet.getCell('A2').value = `Month: ${month}`;
    worksheet.getCell('A2').alignment = { vertical: 'middle' };
    worksheet.getCell('A2').font = { bold: true };

    worksheet.mergeCells('E2:F2');
    const imageId = workbook.addImage({
      filename: path.join(__dirname, 'logo.jpeg'),
      extension: 'jpeg'
    });
    worksheet.addImage(imageId, {
      tl: { col: 4, row: 1.1 },
      br: { col: 6, row: 2 }
    });
    worksheet.getRow(2).height = 22;

    //Fetch data
    const monthlyData = await getReportbyMonth(month);
    if (!monthlyData || monthlyData.length === 0) {
      console.warn(`No uptime data found for month: ${month}`);
    } else {
      let rowIndex = 3;
      monthlyData.forEach(item => {
        const row = worksheet.getRow(rowIndex);
        row.values = item;
        row.commit();
        rowIndex++;
      });

      // Format header row
      worksheet.getRow(3).eachCell(cell => {
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDCE6F1' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      //apply style to the total row
      const totalRowIndex = 3 + monthlyData.length - 1;
      const totalRow = worksheet.getRow(totalRowIndex);
      totalRow.eachCell((cell, colNumber) => {
        cell.font = {bold : true};
        cell.alignment = {
            vertical : 'middle',
            horizontal : colNumber === 1 ? 'left' : 'right'
        };
        cell.fill={
            type : 'pattern',
            pattern : 'solid',
            fgColor : {argb : 'FFFFA726'}
        };
        cell.border= {
            top: {style : 'thin'},
            left: {style : 'thin'},
            bottom : {style : 'thin'},
            right : {style : 'thin'}
        };
      });

      // Adjust column width
      const headerLength = monthlyData[0].length;
      for (let i = 1; i <= headerLength; i++) {
        worksheet.getColumn(i).width = 20; 
      }
    }

    await workbook.xlsx.writeFile(filePath);
    console.log(`Excel file created at: ${filePath}`);
    return filePath
  } catch (error) {
    console.error("Error generating monthly report:", error);
    throw error;
  }
}

// Excel Yearly report generation
async function createExcelYearly(year) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Yearly_Data");

    // Title
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = "YOGI Kanthika Uptime Monitoring: Yearly Report";
    worksheet.getCell('A1').alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell('A1').font= { name : 'Calibri', size : 12};
    worksheet.getCell('A1').font = {bold : true};
    worksheet.getCell('A1').fill = {
      type : 'pattern',
      pattern : 'solid',
      fgColor : { argb : 'FFC6FFC6' }
    };
    worksheet.getRow(1).height = 19;
    worksheet.getCell('A1').border = {bottom : {style : 'thin'}}
    

    // Year Label
    worksheet.getCell('A2').value = `Year : ${year}`;
    worksheet.getCell('A2').font = { bold: true };
    worksheet.getCell('A2').alignment = { vertical: 'middle' };
    worksheet.getRow(2).height = 22;

    // Add logo
    worksheet.mergeCells('D2:E2');
    const imagePath = path.join(__dirname, 'logo.jpeg');
    if (fs.existsSync(imagePath)) {
      const imageId = workbook.addImage({
        filename: imagePath,
        extension: 'jpeg'
      });
      worksheet.addImage(imageId, {
        tl: { col: 3, row: 1.1 },
        br: { col: 5, row: 2 }
      });
    } else {
      console.warn('Logo image not found at', imagePath);
    }

    // Table Headers
    const headerTitles = ["Machine Name", "Year", "Total Up Min", "Total Up Hr", "Total Hr (HH:MM)"];
    worksheet.getRow(3).values = headerTitles;

    worksheet.columns = [
      { key: 'Machine_Name', width: 20 },
      { key: 'Year', width: 20 },
      { key: 'Uptime_Min', width: 20 },
      { key: 'Uptime_Hr', width: 20 },
      { key: 'Total_Hr', width: 20 }
    ];

    // Style header row
    const headerRow = worksheet.getRow(3);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid', 
        fgColor: { argb: "FFDCE6F1" }
      };
      cell.border = {
        bottom: { style: 'thin' },
        top: { style: 'thin' },
        right: { style: 'thin' },
        left: { style: 'thin' }
      };
    });

    // Fetch data
    const yearlyData = await getReportByYear(year);

    if (!yearlyData || yearlyData.length === 0) {
      console.warn(`No uptime data found for year: ${year}`);
    } else {
      let rowIndex = 4;
      yearlyData.forEach(item => {
        worksheet.getRow(rowIndex).values = [
          item.Machine_Name,
          item.Year,
          item.Uptime_Min,
          item.Uptime_Hr,
          item.Total_Hr
        ];
        rowIndex++;
      });
    }

    //Style Total Hr (HH:MM)
    for(let rowIndex = 4; rowIndex <= 8; rowIndex++ ){
      const cell = worksheet.getRow(rowIndex).getCell(5);
      cell.alignment = { horizontal : 'right'};
      cell.font = { bold : true };
    }

    const lastRow = 3 + yearlyData.length;
    const bottomRowBorder = worksheet.getRow(lastRow);
    for(let col = 1; col <= 5; col ++){
      bottomRowBorder.getCell(col).border = { bottom : {style : 'thin'}};
    }

    // Output to reports folder
    const outputPath = 'reports';
    const folderPath = path.join(__dirname, outputPath);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, `yearly_report_${year}.xlsx`);
    await workbook.xlsx.writeFile(filePath);
    console.log("Year report created at:", filePath);
    return filePath
    
  } catch (error) {
    console.error("Error in creating Excel Report:", error);
    throw {
        location: 'controller.generateReport.js → createExcelDaily()',
        message: error.message,
        stack: error.stack
    };
  }
}

module.exports= {
    createExcelDaily, 
    createExcelWeekly, 
    createExcelMonthly,
    createExcelYearly,
}

