const cron = require("node-cron");
const { sequelize } = require('../config/dbConfig');

// Function to update events status
exports.updateEventStatus = async () => {
    try {
        const query = `
            UPDATE events 
            SET "Status" = 'Completed' 
            WHERE end_time < NOW() AND "Status" != 'Completed';
        `;

        await sequelize.query(query, { type: sequelize.QueryTypes.UPDATE });

        console.log("✅ Events status updated successfully");
    } catch (error) {
        console.error("❌ Error updating events status:", error);
    }
};

// Schedule the function to run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
    console.log("⏳ Running scheduled event status update...");
    await exports.updateEventStatus();
});
