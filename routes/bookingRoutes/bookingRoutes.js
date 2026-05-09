const express = require("express");
const router = express.Router();
const protectAdmin = require("../../middleware/authMiddleware");
const adminBookingController = require("../../controller/admin/adminBookingsController");

router.get(
  "/fetch-all-bookings",
  protectAdmin,
  adminBookingController.fetchAllBookings,
);
router.put(
  "/update-booking-status/:id",
  protectAdmin,
  adminBookingController.updateBookingStatus,
);

router.put(
  "/update-service-status/:bookingId/:serviceIndex",
  protectAdmin,
  adminBookingController.updateServiceStatus,
);

module.exports = router;
