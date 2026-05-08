// import mongoose from "mongoose";

// const bookingSchema = new mongoose.Schema(
//   {
//     bookingId: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     customer: {
//       name: {
//         type: String,
//         required: true,
//       },

//       phone: {
//         type: String,
//         required: true,
//       },

//       email: {
//         type: String,
//       },

//       address: {
//         type: String,
//         required: true,
//       },
//     },

//     services: [
//       {
//         serviceId: String,

//         serviceName: String,

//         selectedDate: String,

//         selectedSlot: {
//           time: String,
//         },

//         totalPrice: Number,
//       },
//     ],

//     grandTotal: {
//       type: Number,
//       required: true,
//     },

//     bookingStatus: {
//       type: String,
//       enum: [
//         "Pending",
//         "Confirmed",
//         "Completed",
//         "Cancelled",
//       ],

//       default: "Pending",
//     },
//   },

//   {
//     timestamps: true,
//   }
// );

// const Booking = mongoose.model(
//   "Booking",
//   bookingSchema
// );

// export default Booking;



//import mongoose from "mongoose";
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
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

        // ADD THIS
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
      },
    ],

    grandTotal: {
      type: Number,
      required: true,
    },

    bookingStatus: {
      type: String,

      enum: [
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled",
      ],

      default: "Pending",
    },
  },

  {
    timestamps: true,
  }
);

const Booking = mongoose.model(
  "Booking",
  bookingSchema
);

module.exports = Booking;