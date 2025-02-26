const { sequelize } = require("../config/dbConfig");
const { generateUniqueInteger } = require("../utils/helpers");

// Get All Regions
exports.getAllRegions = async (req, res) => {
  try {
    const result = await sequelize.query("SELECT * FROM region_get_all()", {
      type: sequelize.QueryTypes.SELECT,
    });

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No regions found" });
    }

    res.status(200).json({ data: result });
  } catch (error) {
    console.error("Error fetching regions:", error);
    res.status(500).json({ error: "Failed to fetch regions" });
  }
};

exports.getRegionsByState = async (req, res) => {
  try {
    const { stateId } = req.params;

    const result = await sequelize.query(
      "SELECT * FROM get_regions_by_state(:stateId)",
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { stateId: stateId },
      }
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No regions found" });
    }

    res.status(200).json({ data: result });
  } catch (error) {
    console.error("Error fetching regions:", error);
    res.status(500).json({ error: "Failed to fetch regions" });
  }
};

exports.createRegion = async (req, res) => {
  try {
    const { region, stateid } = req.body;

    if (!region || !stateid) {
      return res
        .status(400)
        .json({ error: "Missing required fields: region or stateid" });
    }

    await sequelize.query(
      "SELECT region_insert(:regionid, :region, :stateid)",
      {
        replacements: { regionid: generateUniqueInteger(), region, stateid },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(201).json({ message: "Region created successfully" });
  } catch (error) {
    console.error("Error creating region:", error);
    res.status(500).json({ error: "Failed to create region" });
  }
};

// Update a Region
exports.updateRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const { region, stateid } = req.body;

    if (!id || !region || !stateid) {
      return res
        .status(400)
        .json({ error: "Missing required fields: id, region, or stateid" });
    }

    await sequelize.query(
      "SELECT region_update(:regionid, :region, :stateid)",
      {
        replacements: { regionid: id, region, stateid },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json({ message: "Region updated successfully" });
  } catch (error) {
    console.error("Error updating region:", error);
    res.status(500).json({ error: "Failed to update region" });
  }
};

// Delete a Region
exports.deleteRegion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing required field: id" });
    }

    await sequelize.query("SELECT region_delete(:regionid)", {
      replacements: { regionid: id },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({ message: "Region deleted successfully" });
  } catch (error) {
    console.error("Error deleting region:", error);
    res.status(500).json({ error: "Failed to delete region" });
  }
};
