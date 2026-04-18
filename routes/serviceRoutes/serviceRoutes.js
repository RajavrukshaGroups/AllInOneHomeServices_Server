const express = require("express");
const router = express.Router();
const protectAdmin = require("../../middleware/authMiddleware");
const AdminServiceController = require("../../controller/admin/adminServiceController");
const upload = require("../../middleware/uploadMiddleWare");

router.post(
  "/create",
  protectAdmin,
  upload.array("images", 5),
  AdminServiceController.createServices,
);
router.get("/fetch", protectAdmin, AdminServiceController.serviceTree);
router.put(
  "/update/:id",
  protectAdmin,
  upload.array("images", 5),
  AdminServiceController.updateService,
);
router.delete(
  "/delete/:id",
  protectAdmin,
  AdminServiceController.deleteService,
);
router.get(
  "/ind-service/:id",
  protectAdmin,
  AdminServiceController.getServiceWithChildren,
);

module.exports = router;
