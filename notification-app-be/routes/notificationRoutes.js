const express = require("express");
const router = express.Router();

const {
  getNotifications,
  getPriorityInbox,
} = require("../controllers/notificationControllers");

// GET all notifications
router.get("/notifications", getNotifications);

// GET top-n priority notifications (default n=10)
router.get("/notifications/priority", getPriorityInbox);

module.exports = router;
