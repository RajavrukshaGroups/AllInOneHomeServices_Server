const mongoose = require("mongoose");

const Booking = require("../../models/Booking");

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

    if (bookingStatus) {
      booking.bookingStatus = bookingStatus;
    }

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

module.exports = {
  fetchAllBookings,
  updateBookingStatus,
  updateServiceStatus,
};
