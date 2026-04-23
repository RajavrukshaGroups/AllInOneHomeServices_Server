const TimeSlot = require("../../models/timeSlotModel");
const Service = require("../../models/service");

const DEFAULT_SLOTS = [
  "09:00-10:00",
  "12:00-13:00",
  "15:00-16:00",
  "17:00-18:00",
];
const createOrUpdateSlots = async (req, res) => {
  try {
    const { serviceId, date, slots, isBlocked } = req.body;

    if (!serviceId || !date) {
      return res.status(400).json({
        message: "serviceId and date are required",
      });
    }

    // Clean slots
    const cleanedSlots = (slots || []).map((s) => ({
      time: s.time,
      capacity: Number(s.capacity) || 0,
    }));

    let existing = await TimeSlot.findOne({ serviceId, date });

    if (existing) {
      existing.slots = cleanedSlots;
      existing.isBlocked = isBlocked || false;
      await existing.save();

      return res.json({
        success: true,
        message: "Slots updated",
        data: existing,
      });
    }

    const newSlot = new TimeSlot({
      serviceId,
      date,
      slots: cleanedSlots,
      isBlocked: isBlocked || false,
    });

    await newSlot.save();

    res.status(201).json({
      success: true,
      message: "Slots created",
      data: newSlot,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getSlotsByServiceAndDate = async (req, res) => {
  try {
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({
        message: "serviceId and date are required",
      });
    }

    const config = await TimeSlot.findOne({ serviceId, date });

    // 🔥 CASE 1: No config → return default slots
    if (!config) {
      return res.json({
        success: true,
        isDefault: true,
        isBlocked: false,
        slots: DEFAULT_SLOTS.map((time) => ({
          time,
          capacity: 999, // unlimited
        })),
      });
    }

    // 🔥 CASE 2: Day blocked
    if (config.isBlocked) {
      return res.json({
        success: true,
        isBlocked: true,
        slots: [],
      });
    }

    // 🔥 CASE 3: Custom slots
    res.json({
      success: true,
      isDefault: false,
      isBlocked: false,
      slots: config.slots,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const deleteSlotConfig = async (req, res) => {
  try {
    const { serviceId, date } = req.body;

    await TimeSlot.deleteOne({ serviceId, date });

    res.json({
      success: true,
      message: "Slot config removed (default applied)",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id).lean();

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getAllSlotsByService = async (req, res) => {
  try {
    const { serviceId } = req.query;

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

module.exports = {
  createOrUpdateSlots,
  getSlotsByServiceAndDate,
  deleteSlotConfig,
  getServiceById,
  getAllSlotsByService,
};
