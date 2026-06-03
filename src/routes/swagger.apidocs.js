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
