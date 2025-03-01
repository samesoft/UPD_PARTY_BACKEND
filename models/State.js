const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/dbConfig");

class State extends Model {}

State.init(
  {
    stateid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "State",
    tableName: "state",
    timestamps: false,
    freezeTableName: true,
  }
);

State.sync({ alter: false, force: false })
  .then(() => console.log("State model synchronized with existing table"))
  .catch((err) => console.error("Error syncing model:", err));

module.exports = { State };
