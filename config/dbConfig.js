const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();
console.log(process.env.DB_Name,  process.env.DB_USER,
  process.env.DB_PASSWORD,)

// Create a Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: 3306,
  }
);

module.exports = { sequelize, Sequelize };