const Service = require("../../models/service");
const TimeSlot = require("../../models/timeSlotModel")

const DEFAULT_SLOTS = [
  "09:00-10:00",
  "12:00-13:00",
  "15:00-16:00",
  "17:00-18:00",
];

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



// const getTheTimeSlotsId = async (req, res) => {
//   try {
//     const { serviceId } = req.params;

//     const timeSlots = await TimeSlot.find({ serviceId });

//     if (timeSlots.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No time slots found for this service",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       count: timeSlots.length,
//       data: timeSlots,
//     });

//   } catch (err) {
//     console.error(err);

//     if (err.name === "CastError") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid service ID",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }

  
// };

const getAllSlotsByService = async (req, res) => {
  try {
     const serviceId = req.params.id;

    if (!serviceId) {
      return res.status(400).json({
        message: "serviceId is required",
      });
    }

    const slots = await TimeSlot.find({ serviceId }).sort({ date: 1 });

    res.json({
      success: true,
      data: slots,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
const getDefaultTimeSlots = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      isDefault: true,
      isBlocked: false,
      slots: DEFAULT_SLOTS.map((time) => ({
        time,
        capacity: 999, // unlimited
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getAllTheServicesSentToClient,
  getAllTheServicesSentToClientId,
  getAllSlotsByService,
  getDefaultTimeSlots,
};