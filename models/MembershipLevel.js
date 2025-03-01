const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/dbConfig");

class MembershipLevel extends Model {}

MembershipLevel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fee_amount: {
      type: DataTypes.NUMERIC,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "MembershipLevel",
    tableName: "membershiplevels",
    timestamps: false,
    freezeTableName: true,
  }
);

MembershipLevel.sync({ alter: false, force: false })
  .then(() =>
    console.log("MembershipLevel model synchronized with existing table")
  )
  .catch((err) => console.error("Error syncing model:", err));

module.exports = { MembershipLevel };
