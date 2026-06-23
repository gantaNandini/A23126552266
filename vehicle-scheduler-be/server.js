const express = require("express");

const app = express();

app.use(express.json());

const schedulerRoutes = require("./routes/schedulerRoutes");

app.use("/", schedulerRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});