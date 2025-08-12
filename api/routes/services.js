const express = require("express");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const router = express.Router();

// GET /services
router.get("/", async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        workers: true,
        timeSlots: true, // could be filtered for available slots
      },
    });

    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        timeSlots: {
          orderBy: { startTime: "asc" },
        },
        workers: true,
      },
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { name, description, duration, timeSlots, workerIds } = req.body;

  if (!name || !description || !duration) {
    return res
      .status(400)
      .json({ error: "Name, description, and duration are required" });
  }

  try {
    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration,
        timeSlots: {
          create:
            timeSlots?.map((slot) => ({
              date: slot.date ? new Date(slot.date) : null, // now supports date
              startTime: slot.startTime,
              endTime: slot.endTime,
            })) || [],
        },
        workers: {
          connect: workerIds?.map((id) => ({ id })) || [],
        },
      },
      include: {
        timeSlots: true,
        workers: true,
      },
    });

    res.status(201).json(service);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ error: "Failed to create service" });
  }
});

module.exports = router;
