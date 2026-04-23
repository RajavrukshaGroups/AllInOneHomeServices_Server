const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  time: {
    type: String, // "09:00-10:00"
    required: true,
  },
  capacity: {
    type: Number,
    default: 1,
  },
});

const timeSlotSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },

    slots: [slotSchema],

    isBlocked: {
      type: Boolean,
      default: false, // full day block
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TimeSlot", timeSlotSchema);
