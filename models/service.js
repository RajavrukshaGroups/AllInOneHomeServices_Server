const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  name: String,
  values: [
    {
      label: String,
      price: Number,
    },
  ],
});

/* ==============================
   FEEDBACK SCHEMA
================================ */
const feedbackSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true,
      trim: true,
    },

    review: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  { timestamps: true },
);

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      default: null,
    },

    type: {
      type: String,
      enum: ["category", "service"],
      default: "service",
    },

    price: Number,

    duration: Number,

    description: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    /* ==============================
       NEW FEEDBACKS ARRAY
    ============================== */
    feedbacks: [feedbackSchema],

    keyFeatures: [
      {
        type: String,
      },
    ],

    options: [optionSchema],

    pricingType: {
      type: String,
      enum: ["fixed", "per_sqft"],
      default: "fixed",
    },

    basePricePerSqft: {
      type: Number,
      default: 0,
    },

    images: [
      {
        type: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Service", serviceSchema);