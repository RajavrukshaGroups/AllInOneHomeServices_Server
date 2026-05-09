const Service = require("../../models/service");
const TimeSlot = require("../../models/timeSlotModel");
const { createBookingService } = require("../../services/bookingService");
const Booking = require("../../models/Booking")

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

// const createBooking =
//   async (req, res) => {
//     try {
//       const {
//         customer,
//         allActiveBookings,
//       } = req.body;

//       if (
//         !customer ||
//         !allActiveBookings?.length
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Booking data missing",
//         });
//       }

//       const booking =
//         await createBookingService(
//           customer,
//           allActiveBookings
//         );

//       res.status(201).json({
//         success: true,

//         message:
//           "Booking confirmed successfully",

//         bookingId:
//           booking.bookingId,

//         booking,
//       });
//     } catch (error) {
//       console.log(error);

//       res.status(500).json({
//         success: false,
//         message: "Server Error",
//       });
//     }
//   };

const createBooking = async (req, res) => {
  try {
    const {
      customer,
      allActiveBookings,
      userState, // ADD THIS
    } = req.body;

    // VALIDATION
    if (
      !customer ||
      !customer.name ||
      !customer.phone ||
      !customer.address
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer details are required",
      });
    }

    if (
      !allActiveBookings ||
      !Array.isArray(allActiveBookings) ||
      allActiveBookings.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No services selected",
      });
    }

    // CREATE BOOKING
    const booking =
      await createBookingService(
        customer,
        allActiveBookings,
        userState // PASS HERE
      );

    return res.status(201).json({
      success: true,

      message:
        "Booking confirmed successfully",

      bookingId:
        booking.bookingId,

      booking,
    });
  } catch (error) {
    console.log(
      "CREATE BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// const getBookingBySearch = async (req, res) => {
//   try {
//     const { search } = req.query;

//     if (!search) {
//       return res.status(400).json({
//         success: false,
//         message: "Search query is required",
//       });
//     }

//     const searchText = search.trim();

//     const booking = await Booking.findOne({
//       $or: [
//         { bookingId: searchText },
//         { "customer.phone": searchText },
//       ],
//     });

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "No booking found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: booking,
//     });

//   } catch (error) {
//     console.error("SERVER ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
const getBookingBySearch = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchText = search.trim();

    let bookings = [];

    // IF SEARCHING BY BOOKING ID
    if (
      searchText.startsWith("MKHS-")
    ) {
      const booking =
        await Booking.findOne({
          bookingId: searchText,
        });

      if (booking) {
        bookings = [booking];
      }
    }

    // IF SEARCHING BY PHONE NUMBER
    else {
      bookings = await Booking.find({
        "customer.phone":
          searchText,
      }).sort({
        createdAt: -1,
      });
    }

    // NO BOOKINGS FOUND
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No booking found",
      });
    }

    return res.status(200).json({
      success: true,
      total: bookings.length,
      data: bookings,
    });

  } catch (error) {
    console.error(
      "SERVER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllTheServicesSentToClient,
  getAllTheServicesSentToClientId,
  getAllSlotsByService,
  getDefaultTimeSlots,
  createBooking,
  getBookingBySearch
};