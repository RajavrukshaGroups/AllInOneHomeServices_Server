const mongoose = require("mongoose");

const Booking = require("../../models/Booking");
const Service = require("../../models/service");

const fetchAllBookings = async (req, res) => {
  try {
    /* ==============================
       PAGINATION
    ============================== */
    const page = Number(req.query.page) || 1;

    const limit = 15;

    const skip = (page - 1) * limit;

    /* ==============================
       SEARCH
    ============================== */
    const search = req.query.search?.trim() || "";

    let searchQuery = {};

    if (search) {
      searchQuery = {
        $or: [
          {
            bookingId: {
              $regex: search,
              $options: "i",
            },
          },

          {
            "customer.name": {
              $regex: search,
              $options: "i",
            },
          },

          {
            "customer.phone": {
              $regex: search,
              $options: "i",
            },
          },

          {
            "customer.email": {
              $regex: search,
              $options: "i",
            },
          },

          {
            bookingStatus: {
              $regex: search,
              $options: "i",
            },
          },

          {
            "services.serviceName": {
              $regex: search,
              $options: "i",
            },
          },
        ],
      };
    }

    /* ==============================
       FETCH BOOKINGS
    ============================== */
    const bookings = await Booking.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    /* ==============================
       TOTAL COUNT
    ============================== */
    const totalBookings = await Booking.countDocuments(searchQuery);

    const totalPages = Math.ceil(totalBookings / limit);

    res.status(200).json({
      success: true,

      currentPage: page,

      totalPages,

      totalBookings,

      limit,

      data: bookings,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// const updateBookingStatus = async (req, res) => {
//   try {
//     const { bookingStatus, workProgress, paymentStatus } = req.body;

//     const booking = await Booking.findById(req.params.id);

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     if (bookingStatus) {
//       booking.bookingStatus = bookingStatus;
//     }

//     if (workProgress) {
//       booking.workProgress = workProgress;
//     }

//     if (paymentStatus) {
//       booking.paymentStatus = paymentStatus;
//     }

//     await booking.save();

//     res.status(200).json({
//       success: true,
//       message: "Booking updated successfully",
//       data: booking,
//     });
//   } catch (err) {
//     console.log(err);

//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

const updateBookingStatus = async (req, res) => {
  try {
    const { bookingStatus, workProgress, paymentStatus } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    /* ==============================
       BOOKING STATUS
    ============================== */
    if (bookingStatus) {
      booking.bookingStatus = bookingStatus;

      /* ==============================
         CANCEL ENTIRE BOOKING
      ============================== */
      if (bookingStatus === "Cancelled") {
        booking.services = booking.services.map((service) => ({
          ...service.toObject(),
          workProgress: "Cancelled",
        }));
      }

      /* ==============================
         REVIVE BOOKING
      ============================== */
      if (bookingStatus === "Confirmed") {
        booking.services = booking.services.map((service) => ({
          ...service.toObject(),
          workProgress:
            service.workProgress === "Cancelled"
              ? "Not Started"
              : service.workProgress,
        }));
      }
    }

    /* ==============================
       OPTIONAL ROOT LEVEL FIELDS
    ============================== */
    if (workProgress) {
      booking.workProgress = workProgress;
    }

    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateServiceStatus = async (req, res) => {
  try {
    const { workProgress, paymentStatus } = req.body;

    const { bookingId, serviceIndex } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const service = booking.services[serviceIndex];

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (workProgress) {
      service.workProgress = workProgress;
    }

    if (paymentStatus) {
      service.paymentStatus = paymentStatus;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Service status updated",
      data: booking,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const fetchOverallDetails = async (req, res) => {
  try {
    /* ==============================
       TOTAL SERVICES
    ============================== */
    const totalServices = await Service.countDocuments({
      type: "service",
      isActive: true,
    });

    /* ==============================
       TOTAL BOOKINGS
    ============================== */
    const totalBookings = await Booking.countDocuments({
      bookingStatus: {
        $ne: "Cancelled",
      },
    });

    /* ==============================
       TOTAL CUSTOMERS
    ============================== */
    const uniqueCustomers = await Booking.distinct("customer.phone");

    const totalCustomers = uniqueCustomers.length;

    /* ==============================
       TOTAL REVENUE
    ============================== */
    const revenueResult = await Booking.aggregate([
      {
        $match: {
          bookingStatus: {
            $ne: "Cancelled",
          },
        },
      },

      {
        $group: {
          _id: null,

          totalRevenue: {
            $sum: "$grandTotal",
          },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    /* ==============================
       PAYMENT STATS
    ============================== */
    /* ==============================
   PAYMENT STATS
============================== */
    const paymentStats = await Booking.aggregate([
      {
        $unwind: "$services",
      },

      {
        $project: {
          paymentStatus: {
            $ifNull: ["$services.paymentStatus", "Pending"],
          },
        },
      },

      {
        $group: {
          _id: "$paymentStatus",

          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const formattedPayments = {
      pending: 0,
      partiallyPaid: 0,
      paid: 0,
    };

    paymentStats.forEach((item) => {
      if (item._id === "Pending") {
        formattedPayments.pending = item.count;
      }

      if (item._id === "Partially Paid") {
        formattedPayments.partiallyPaid = item.count;
      }

      if (item._id === "Paid") {
        formattedPayments.paid = item.count;
      }
    });

    /* ==============================
   WORK PROGRESS STATS
============================== */
    const progressStats = await Booking.aggregate([
      {
        $unwind: "$services",
      },

      {
        $project: {
          workProgress: {
            $ifNull: ["$services.workProgress", "Not Started"],
          },
        },
      },

      {
        $group: {
          _id: "$workProgress",

          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const formattedProgress = {
      notStarted: 0,
      assigned: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    };

    progressStats.forEach((item) => {
      if (item._id === "Not Started") {
        formattedProgress.notStarted = item.count;
      }

      if (item._id === "Assigned") {
        formattedProgress.assigned = item.count;
      }

      if (item._id === "In Progress") {
        formattedProgress.inProgress = item.count;
      }

      if (item._id === "Completed") {
        formattedProgress.completed = item.count;
      }

      if (item._id === "Cancelled") {
        formattedProgress.cancelled = item.count;
      }
    });

    /* ==============================
       RESPONSE
    ============================== */
    res.status(200).json({
      success: true,

      data: {
        totalServices,

        totalBookings,

        totalCustomers,

        totalRevenue,

        payments: formattedPayments,

        progress: formattedProgress,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};

module.exports = {
  fetchAllBookings,
  updateBookingStatus,
  updateServiceStatus,
  fetchOverallDetails,
};
