const axios = require("axios");
const { Log } = require("../../logging-middleware/logger");
const { getPriorityNotifications } = require("../services/priorityService");

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJnYW50YW5hbmRpbmkuMjMuY3NtQGFuaXRzLmVkdS5pbiIsImV4cCI6MTc4MjE5OTg0MSwiaWF0IjoxNzgyMTk4OTQxLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZDAwNDk4MWQtZTFmMi00NzUyLWI5YzgtMTgyMWE3ZmU5NDE1IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibmFuZGluaSBnYW50YSIsInN1YiI6ImIzMzYwMGUzLTI5ZWItNDJkMC05NTA0LTVjZmI0YmY1NGM3NCJ9LCJlbWFpbCI6ImdhbnRhbmFuZGluaS4yMy5jc21AYW5pdHMuZWR1LmluIiwibmFtZSI6Im5hbmRpbmkgZ2FudGEiLCJyb2xsTm8iOiJhMjMxMjY1NTIyNjYiLCJhY2Nlc3NDb2RlIjoiTVRxeGFyIiwiY2xpZW50SUQiOiJiMzM2MDBlMy0yOWViLTQyZDAtOTUwNC01Y2ZiNGJmNTRjNzQiLCJjbGllbnRTZWNyZXQiOiJNY05wd3JyYWVrSFN5VnpVIn0.Nc_fbRrADpDmunn35lJLmVNmcOYgha6tTutJepQG--o";

// GET /notifications — fetch all from Affordmed API
exports.getNotifications = async (req, res) => {
  try {
    await Log("backend", "info", "controller", "Fetching all notifications");

    const response = await axios.get(
      "http://4.224.186.213/evaluation-service/notifications",
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );

    const notifications = response.data.notifications;
    await Log("backend", "info", "controller", `Fetched ${notifications.length} notifications`);

    res.json({ notifications });
  } catch (error) {
    await Log("backend", "error", "controller", error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
};

// GET /notifications/priority?n=10 — top-n priority inbox
exports.getPriorityInbox = async (req, res) => {
  try {
    const n = parseInt(req.query.n) || 10;
    await Log("backend", "info", "controller", `Fetching top ${n} priority notifications`);

    const response = await axios.get(
      "http://4.224.186.213/evaluation-service/notifications",
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );

    const notifications = response.data.notifications;
    const topN = getPriorityNotifications(notifications, n);

    await Log("backend", "info", "controller", `Returning top ${n} priority notifications`);

    res.json({ count: topN.length, notifications: topN });
  } catch (error) {
    await Log("backend", "error", "controller", error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
};
