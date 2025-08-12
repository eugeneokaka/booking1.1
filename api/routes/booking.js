const express = require("express");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const router = express.Router();

/**
 * Example body:
 * {
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "email": "john@example.com",
 *   "phone": "123456789",
 *   "serviceId": "uuid-of-service",
 *   "workerId": "uuid-of-worker",
 *   "date": "2025-08-15",
 *   "startTime": "10:00",
 *   "endTime": "11:00"
 * }
 */
router.get("/", async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        worker: true,
        timeSlot: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});
router.post("/", async (req, res) => {
  const { date, startTime, endTime, serviceId, workerId, userId } = req.body;
  console.log("Booking request data:", req.body);
  // const userId = req.userId; // from JWT middleware

  if (!date || !startTime || !endTime || !serviceId || !workerId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Step 1: Check if a time slot already exists with same date and time
    const existingTimeSlot = await prisma.timeSlot.findFirst({
      where: {
        date: new Date(date),
        startTime,
        endTime,
        serviceId,
        isBooked: true,
      },
    });

    if (existingTimeSlot) {
      return res
        .status(409)
        .json({ error: "This time slot is already booked" });
    }

    // Step 2: Create or find the timeslot
    let timeSlot = await prisma.timeSlot.findFirst({
      where: {
        date: new Date(date),
        startTime,
        endTime,
        serviceId,
      },
    });

    if (!timeSlot) {
      timeSlot = await prisma.timeSlot.create({
        data: {
          date: new Date(date),
          startTime,
          endTime,
          serviceId,
        },
      });
    }

    // Step 3: Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        timeSlotId: timeSlot.id,
        workerId,
      },
    });

    // Step 4: Mark timeslot as booked
    await prisma.timeSlot.update({
      where: { id: timeSlot.id },
      data: { isBooked: true },
    });

    res.status(201).json({ message: "Booking created", booking });
    console.log("Booking created:", booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});
module.exports = router;
