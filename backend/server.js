const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const analyticsRoutes = require("./routes/analytics");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/issues", require("./routes/issues"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/analytics", analyticsRoutes);

app.listen(5000, () =>
  console.log("Node backend running on port 5000")
);
