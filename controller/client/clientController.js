// const Service = require("../../models/service");

// const getAllTheServicesSentToClient = async (req, res) => {
//   try {
//     // Fetch all services
//     const services = await Service.find();

//     // Optional: check if no data
//     if (!services || services.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No services found",
//       });
//     }

//     // Send response
//     res.status(200).json({
//       success: true,
//       count: services.length,
//       data: services,
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// const getAllTheServicesSentToClientId = async (req, res)=>{
//   try{

//   }catch(err){

//   }
// }



// module.exports = {
//   getAllTheServicesSentToClient,
// };

const Service = require("../../models/service");

// Get all services
const getAllTheServicesSentToClient = async (req, res) => {
  try {
    const services = await Service.find();

    if (!services || services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No services found",
      });
    }

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get service by ID
const getAllTheServicesSentToClientId = async (req, res) => {
  try {
    const { id } = req.params;

    // If you're using MongoDB default _id
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });

  } catch (err) {
    console.error(err);

    // Handle invalid ObjectId
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getAllTheServicesSentToClient,
  getAllTheServicesSentToClientId,
};