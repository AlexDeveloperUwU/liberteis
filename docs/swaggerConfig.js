const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LiberTeis API Documentation",
      version: "1.0.0",
    },
  },
  apis: ["./routes/api/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = { specs };
