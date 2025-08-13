const express = require("express");
const cors = require("cors");
// const { PrismaClient } = require("@prisma/client");
const { PrismaClient } = require("./generated/prisma"); // Adjust the path as necessary
const jwt = require("jsonwebtoken");
const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000", // React frontend URL or any allowed origin
    credentials: true, // if you want to allow cookies/auth headers
  })
);
app.use(express.json());

// Routes
const serviceRoutes = require("./routes/services");
const workerRoutes = require("./routes/worker");
const bookingRoutes = require("./routes/booking");
const userRoutes = require("./routes/user");
const cookieParser = require("cookie-parser");

app.use("/users", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/services", serviceRoutes);
app.use("/workers", workerRoutes);
app.use(cookieParser());
// Health Check
app.get("/", (req, res) => {
  res.send("Event Booking API is running!");
});

function authMiddleware(req, res, next) {
  const token = req.cookies.token; // Read from cookie
  console.log("Auth token from cookie:", token);

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
}

// Get logged in user
app.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { firstName: true, lastName: true, email: true, id: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
