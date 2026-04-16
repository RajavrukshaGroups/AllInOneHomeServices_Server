const express = require("express");
const router = express.Router();
const protectAdmin = require("../../middleware/authMiddleware");
const AdminLoginController = require("../../controller/admin/adminLoginController");

router.post("/login", AdminLoginController.loginDetails);
router.post("/logout", AdminLoginController.logoutDetails);

module.exports = router;
