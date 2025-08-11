const express = require("express");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const router = express.Router();

/**
 * Body:
 * {
 *   fullName: "John Doe",
 *   email: "john@example.com",
 *   phone: "123456789",
 *   serviceId: 2,
 *   workerId: 3,
 *   date: "2025-08-15",
 *   startTime: "10:00",
 *   endTime: "11:00"
 * }
 */
router.post("/", async (req, res) => {
  const {
    fullName,
    email,
    phone,
    serviceId,
    workerId,
    date,
    startTime,
    endTime,
  } = req.body;

  if (
    !fullName ||
    !email ||
    !phone ||
    !serviceId ||
    !workerId ||
    !date ||
    !startTime ||
    !endTime
  ) {
    return res.status(400).json({
      error:
        "fullName, email, phone, serviceId, workerId, date, startTime, and endTime are required",
    });
  }

  try {
    // 1. Create or get user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { fullName, email, phone },
      });
    }

    // 2. Check if slot already exists for the same date and time
    const existingSlot = await prisma.timeSlot.findFirst({
      where: {
        serviceId,
        date: new Date(date),
        startTime,
        endTime,
      },
    });

    if (existingSlot) {
      return res.status(400).json({
        error: "This time slot is already booked for the selected date.",
      });
    }

    // 3. Create a new time slot for the specific date
    const newSlot = await prisma.timeSlot.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        isBooked: true,
        serviceId,
      },
    });

    // 4. Create booking linked to that time slot and user
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        timeSlotId: newSlot.id,
        workerId,
      },
      include: {
        user: true,
        timeSlot: true,
        worker: true,
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

module.exports = router;

// const express = require("express");
// const { PrismaClient } = require("../generated/prisma");
// const prisma = new PrismaClient();
// const router = express.Router();

// /**
//  * Body:
//  * {
//  *   userId: 1,
//  *   serviceId: 2,
//  *   workerId: 3,
//  *   date: "2025-08-15",
//  *   startTime: "10:00",
//  *   endTime: "11:00"
//  * }
//  */
// router.post("/", async (req, res) => {
//   const { userId, serviceId, workerId, date, startTime, endTime } = req.body;

//   if (!userId || !serviceId || !workerId || !date || !startTime || !endTime) {
//     return res.status(400).json({
//       error:
//         "userId, serviceId, workerId, date, startTime, and endTime are required",
//     });
//   }

//   try {
//     // Check if the same slot for that date/service is already booked
//     const existingSlot = await prisma.timeSlot.findFirst({
//       where: {
//         serviceId,
//         date: new Date(date),
//         startTime,
//         endTime,
//         isBooked: true,
//       },
//     });

//     if (existingSlot) {
//       return res.status(400).json({
//         error: "This time slot is already booked for the selected date.",
//       });
//     }

//     // Create a new time slot for the specific date
//     const newSlot = await prisma.timeSlot.create({
//       data: {
//         date: new Date(date),
//         startTime,
//         endTime,
//         isBooked: true, // mark as booked immediately
//         serviceId,
//       },
//     });

//     // Create booking linked to that time slot
//     const booking = await prisma.booking.create({
//       data: {
//         userId,
//         timeSlotId: newSlot.id,
//         workerId,
//       },
//       include: {
//         user: true,
//         timeSlot: true,
//         worker: true,
//       },
//     });

//     res.status(201).json(booking);
//   } catch (error) {
//     console.error("Error creating booking:", error);
//     res.status(500).json({ error: "Failed to create booking" });
//   }
// });

// module.exports = router;
