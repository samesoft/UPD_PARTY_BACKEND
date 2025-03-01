const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/stats", dashboardController.getDashboardStats);
router.get("/member-growth", dashboardController.getMembersByMonth);
router.get("/member-state-growth", dashboardController.getMembersByState);

router.get("/state-distribution", dashboardController.getStateDistribution);
router.get("/recent-activities", dashboardController.getRecentActivities);

module.exports = router;
