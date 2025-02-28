const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/stats", dashboardController.getDashboardStats);
router.get("/member-growth", dashboardController.getMemberGrowth);
router.get("/state-distribution", dashboardController.getStateDistribution);
router.get("/recent-activities", dashboardController.getRecentActivities);

module.exports = router;
