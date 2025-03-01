const { DataTypes, Model } = require("sequelize");

const { sequelize, Sequelize } = require("../config/dbConfig");

class Member extends Model {}

Member.init(
  {
    member_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    middle_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    party_role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    memb_level_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    district_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    age_group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    edu_level_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    party_role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "state",
        key: "stateid",
      },
    },
    profile_photo_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    device_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Member",
    tableName: "members",
    timestamps: true,
    freezeTableName: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Member.sync({ alter: false, force: false })
  .then(() => console.log("Member model synchronized with existing table"))
  .catch((err) => console.error("Error syncing model:", err));

module.exports = { Member };
