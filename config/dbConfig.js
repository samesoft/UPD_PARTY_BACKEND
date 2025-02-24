const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
// Load environment variables from .env file
dotenv.config();
// Create a Sequelize instance for PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432, // Default PostgreSQL port is 5432
    dialect: "postgres", // Use PostgreSQL as the database dialect
    logging: false, // Disable SQL query logging (optional)
  }
);
// Export the Sequelize instance and Sequelize class
module.exports = { sequelize, Sequelize };
