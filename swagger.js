// swagger.js

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "YOGI Kanthika :- Uptime Monitoring Dashboard",
			version: "1.0.0",
			description: "A dashboard to monitor Uptime and downtime of all machines and generate reports for efficiency",
		},
		servers: [
			{
				url: "http://localhost:3000/api", // Adjust as needed
			},
		],
	},
	apis: ["src/routes/swagger.apidocs.js"], // path to your route files for auto-generation
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
	swaggerUi,
	swaggerSpec,
};
