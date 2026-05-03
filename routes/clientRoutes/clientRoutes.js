const express = require("express");
const router = express.Router();
const ClientController=require("../../controller/client/clientController")

router.get("/send-services-client",ClientController.getAllTheServicesSentToClient)
router.get("/send-services-client/:id",ClientController.getAllTheServicesSentToClientId)
router.get("/send-time-slot/:id",ClientController.getAllSlotsByService)
router.get("/send-default-time-slots",ClientController.getDefaultTimeSlots)


module.exports=router