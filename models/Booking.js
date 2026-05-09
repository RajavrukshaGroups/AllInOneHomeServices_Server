const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },

    // ADD THIS
    isActive: {
      type: Boolean,
      default: true,
    },

    customer: {
      name: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      email: {
        type: String,
      },

      address: {
        type: String,
        required: true,
      },
    },

    services: [
      {
        serviceId: String,

        serviceName: String,

        selectedPriceOptions: [
          {
            title: String,
            price: Number,
          },
        ],

        selectedDate: String,

        selectedSlot: {
          time: String,
        },

        totalPrice: Number,

        // ✅ ADD THESE
        workProgress: {
          type: String,

          enum: [
            "Not Started",
            "Assigned",
            "In Progress",
            "Completed",
            "Cancelled",
          ],

          default: "Not Started",
        },

        paymentStatus: {
          type: String,

          enum: ["Pending", "Partially Paid", "Paid"],

          default: "Pending",
        },
      },
    ],
    grandTotal: {
      type: Number,
      required: true,
    },

    bookingStatus: {
      type: String,

      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],

      default: "Confirmed",
    },
  },
  {
    timestamps: true,
  },
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
