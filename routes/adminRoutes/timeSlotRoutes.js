const express = require("express");
const router = express.Router();
const protectAdmin = require("../../middleware/authMiddleware");
const AdminTimeSlotController = require("../../controller/admin/adminTimeSlotController");

router.post(
  "/create-update-timeslots",
  protectAdmin,
  AdminTimeSlotController.createOrUpdateSlots,
);
router.get(
  "/get-timeslots",
  protectAdmin,
  AdminTimeSlotController.getSlotsByServiceAndDate,
);
router.delete(
  "/delete-timeslots",
  protectAdmin,
  AdminTimeSlotController.deleteSlotConfig,
);
router.get(
  "/get-service/:id",
  protectAdmin,
  AdminTimeSlotController.getServiceById,
);
router.get(
  "/get-all-timeslots",
  protectAdmin,
  AdminTimeSlotController.getAllSlotsByService,
);

module.exports = router;
