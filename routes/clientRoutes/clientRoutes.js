const express = require("express");
const router = express.Router();
const ClientController=require("../../controller/client/clientController")

router.get("/send-services-client",ClientController.getAllTheServicesSentToClient)


module.exports=router