const express = require("express");
const router = express.Router();
const ContactController = require("../../controller/client/contactController");

router.post("/contact-page", ContactController.PostContactController);

module.exports = router;
