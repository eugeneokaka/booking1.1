const express = require("express");
const cors = require("cors");
// const { PrismaClient } = require("@prisma/client");
const { PrismaClient } = require("./generated/prisma"); // Adjust the path as necessary

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const serviceRoutes = require("./routes/services");
const workerRoutes = require("./routes/worker");
const bookingRoutes = require("./routes/booking");
app.use("/bookings", bookingRoutes);
app.use("/services", serviceRoutes);
app.use("/workers", workerRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("Event Booking API is running!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
