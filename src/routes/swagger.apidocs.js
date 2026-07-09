/**
 * @swagger
 * /machineStatus:
 *   get:
 *     summary: Get the Current status "ON" or "OFF" of each shopfloor machine.
 *     tags: [Machine]
 *     responses:
 *       200:
 *         description: Successfully retrieved machine status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 err:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ID:
 *                         type: integer
 *                         example: 1
 *                       machine_id:
 *                         type: string
 *                         example: "KHAL_MIXING_01"
 *                       Timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-30T09:30:00Z"
 *                       Event:
 *                         type: string
 *                         example: "RUNNING"
 *       500:
 *         description: Internal server or database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 *                 detail:
 *                   type: string
 *                   example: "Connection refused"
 *                 data:
 *                   type: "null"
 */
/**
 * @swagger
 * dashboard/uptime/getdata:
 *   post:
 *     summary: Get machine uptime data by date
 *     tags: [Uptime]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-30
 *     responses:
 *       200:
 *         description: Successfully retrieved uptime data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID:
 *                     type: integer
 *                     example: 1
 *                   machine_id:
 *                     type: string
 *                     example: "MIXER_01"
 *                   start_time:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-06-30T08:00:00Z"
 *                   end_time:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-06-30T10:00:00Z"
 *                   duration:
 *                     type: number
 *                     format: float
 *                     example: 2.0
 *       400:
 *         description: Missing required parameter `date`
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errMsg:
 *                   type: string
 *                   example: "Missing required parameter--> date"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errMsg:
 *                   type: string
 *                   example: "Internal server error"
 *                 err:
 *                   type: string
 *                   example: "No data found for the given date"
 *                 srrStack:
 *                   type: string
 *                 errLocation:
 *                   type: string
 *                   example: "At try-catch block of route /uptime/getdata"
 */
/**
 * @swagger
 * dashboard/uptime/report:
 *   post:
 *     summary: Generate and retrieve uptime report by date
 *     tags: [Uptime]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-30
 *     responses:
 *       200:
 *         description: Successfully generated uptime report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ID:
 *                         type: integer
 *                         example: 1
 *                       machine_id:
 *                         type: string
 *                         example: "MIXER_01"
 *                       start_time:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-30T08:00:00Z"
 *                       end_time:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-30T10:00:00Z"
 *                       duration:
 *                         type: number
 *                         format: float
 *                         example: 2.0
 *                 filepath:
 *                   type: string
 *                   example: "./reports/uptime_2025-06-30.xlsx"
 *       400:
 *         description: Missing required parameter `date`
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errMsg:
 *                   type: string
 *                   example: "Missing required parameter--> date"
 *       500:
 *         description: Internal server error during uptime report generation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errMsg:
 *                   type: string
 *                   example: "Internal server error"
 *                 err:
 *                   type: string
 *                   example: "No data found for the given date"
 *                 srrStack:
 *                   type: string
 *                 errLocation:
 *                   type: string
 *                   example: "At try-catch block of route /uptime/getdata"
 */

/**
 * @swagger
 * tags:
 *   - name: Work Hours
 *     description: APIs for retrieving and updating daily work hours
 *
 * /dashboard/getworkhoursbymonth:
 *   get:
 *     summary: Get work hours for a specific month
 *     description: |
 *       Retrieves the configured work hours for every date in the specified month.
 *
 *       The month must be provided in `YYYY-MM` format.
 *
 *       Example:
 *       - `2026-07` for July 2026
 *       - `2026-12` for December 2026
 *
 *       The API returns the work-hour configuration for each date of the requested month.
 *     tags:
 *       - Work Hours
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         description: Month for which work-hour data is required, in YYYY-MM format
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-(0[1-9]|1[0-2])$'
 *           example: "2026-07"
 *     responses:
 *       200:
 *         description: Work hours retrieved successfully for the requested month
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: Date in YYYY-MM-DD format
 *                     example: "2026-07-01"
 *                   hours:
 *                     type: number
 *                     format: float
 *                     description: Configured work hours for the date
 *                     example: 8
 *             example:
 *               - date: "2026-07-01"
 *                 hours: 8
 *               - date: "2026-07-02"
 *                 hours: 8
 *               - date: "2026-07-03"
 *                 hours: 10
 *
 *       400:
 *         description: Missing required month query parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errMsg:
 *                   type: string
 *                   description: Error message describing the missing parameter
 *             example:
 *               errMsg: "Missing required parameter: month"
 *
 *       404:
 *         description: No work-hour data found for the requested month
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errMsg:
 *                   type: string
 *                   description: Error message indicating that no data was found
 *             example:
 *               errMsg: "No work hours found for month: 2026-07"
 *
 *       500:
 *         description: Internal server error while retrieving work-hour data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: General error category
 *                 message:
 *                   type: string
 *                   description: Detailed error message
 *                 stack:
 *                   type: string
 *                   description: Error stack trace
 *                 location:
 *                   type: string
 *                   description: API route where the error occurred
 *             example:
 *               error: "Internal server error"
 *               message: "Database connection failed"
 *               stack: "Error: Database connection failed..."
 *               location: "/getworkhoursbymonth"
 *
 * /dashboard/setworkhoursbydate:
 *   post:
 *     summary: Set work hours for a specific date
 *     description: |
 *       Sets or updates the configured work hours for a specific date.
 *
 *       The request body must contain:
 *       - `date` in `YYYY-MM-DD` format
 *       - `hours` representing the number of work hours for that date
 *
 *       This API can be used to configure different work hours for regular
 *       working days, weekends, holidays, shutdown days, or overtime days.
 *     tags:
 *       - Work Hours
 *     requestBody:
 *       required: true
 *       description: Date and corresponding work hours to be configured
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - hours
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date for which work hours should be set, in YYYY-MM-DD format
 *                 example: "2026-07-09"
 *               hours:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 24
 *                 description: Number of work hours to configure for the specified date
 *                 example: 8
 *           examples:
 *             regularWorkingDay:
 *               summary: Regular 8-hour working day
 *               value:
 *                 date: "2026-07-09"
 *                 hours: 8
 *             overtimeDay:
 *               summary: 12-hour working day
 *               value:
 *                 date: "2026-07-10"
 *                 hours: 12
 *             holiday:
 *               summary: Holiday or shutdown day
 *               value:
 *                 date: "2026-07-11"
 *                 hours: 0
 *
 *     responses:
 *       200:
 *         description: Work hours set successfully for the specified date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *             example:
 *               message: "Work hours set successfully for date: 2026-07-09"
 *
 *       400:
 *         description: Missing required date or hours parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errMsg:
 *                   type: string
 *                   description: Error message describing the missing parameters
 *             example:
 *               errMsg: "Missing required parameters: date and hours"
 *
 *       404:
 *         description: Failed to set work hours for the specified date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errMsg:
 *                   type: string
 *                   description: Error message indicating that the operation failed
 *             example:
 *               errMsg: "Failed to set work hours for date: 2026-07-09"
 *
 *       500:
 *         description: Internal server error while setting work-hour data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: General error category
 *                 message:
 *                   type: string
 *                   description: Detailed error message
 *                 stack:
 *                   type: string
 *                   description: Error stack trace
 *                 location:
 *                   type: string
 *                   description: API route where the error occurred
 *             example:
 *               error: "Internal server error"
 *               message: "Database query failed"
 *               stack: "Error: Database query failed..."
 *               location: "/setworkhoursbydate"
 */