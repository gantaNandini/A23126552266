const express = require("express");
const cors = require("cors");
const { Log } = require("../logging-middleware/logger");

const app = express();
app.use(cors());
app.use(express.json());

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/", notificationRoutes);

const PORT = 4000;

app.listen(PORT, async () => {
  await Log("backend", "info", "service", "Notification service started");
  console.log(`Notification service running on port ${PORT}`);
});
