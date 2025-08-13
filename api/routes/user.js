const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();
const router = express.Router();

// Secret for JWT (store in .env)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

// Use cookie-parser in your main server file:
// const app = express();
// app.use(cookieParser());

// Create user (Sign Up)
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * GET /users/:userId/bookings
 * Returns all bookings for a specific user
 */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        timeSlot: {
          include: {
            service: true,
          },
        },
        worker: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user bookings" });
  }
});
router.post("/", async (req, res) => {
  let { firstName, lastName, email, phone, password } = req.body;
  console.log("Received data:", req.body);

  if (!firstName || !lastName || !email || !phone || !password) {
    return res.status(400).json({
      error: "firstName, lastName, email, phone, and password are required",
    });
  }

  email = email.toLowerCase().trim();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
      },
    });

    res
      .status(201)
      .json({ message: "User created successfully", userId: newUser.id });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  console.log("Login request data:", req.body);

  // Check required fields
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Clean up email
  email = email.toLowerCase().trim();
  console.log("Cleaned email:", email);

  try {
    // Find user by email only
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare hashed passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set JWT in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
