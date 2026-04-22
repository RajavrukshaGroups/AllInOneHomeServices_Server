const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  name: String,
  values: [
    {
      label: String, // "1BHK"
      price: Number, // 1000
    },
  ],
});

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

    duration: Number, // in minutes

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
