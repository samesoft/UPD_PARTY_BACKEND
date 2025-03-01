const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/dbConfig");

class Event extends Model {}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by_member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    district_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Event",
    tableName: "events",
    timestamps: false,
    freezeTableName: true,
  }
);

Event.sync({ alter: false, force: false })
  .then(() => console.log("Event model synchronized with existing table"))
  .catch((err) => console.error("Error syncing model:", err));

module.exports = { Event };
