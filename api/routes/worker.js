// routes/workers.js
const express = require("express");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const router = express.Router();

// POST /workers - Create a new worker (with or without service)
router.post("/", async (req, res) => {
  try {
    const { name, email, serviceId } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    let service = null;

    // If serviceId is provided, check if it exists
    if (serviceId) {
      service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
    }

    // Create worker
    const worker = await prisma.worker.create({
      data: {
        name,
        email,
        serviceId: service ? service.id : null,
      },
    });

    res.status(201).json({
      message: "Worker created successfully",
      worker,
    });
  } catch (error) {
    if (error.code === "P2002") {
      // Prisma unique constraint error
      return res
        .status(400)
        .json({ error: "Worker with this email already exists" });
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
