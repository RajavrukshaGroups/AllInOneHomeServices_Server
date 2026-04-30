const express = require("express");
const router = express.Router();
const ClientController=require("../../controller/client/clientController")

router.get("/send-services-client",ClientController.getAllTheServicesSentToClient)
router.get("/send-services-client/:id",ClientController.getAllTheServicesSentToClientId)


module.exports=router