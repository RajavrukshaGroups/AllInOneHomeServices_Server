const mongoose = require("mongoose");
const Service = require("../../models/service");

/* ==============================
   HELPER: Normalize parentId
================================ */
const normalizeParentId = (parentId) => {
  if (!parentId) return null;
  if (Array.isArray(parentId)) return parentId[parentId.length - 1];
  return parentId;
};

/* ==============================
   CREATE SERVICE
================================ */
const createServices = async (req, res) => {
  try {
    const { name, pricingType, basePricePerSqft } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Service name is required",
      });
    }

    /* ==============================
       ✅ PARSE OPTIONS
    ============================== */
    let parsedOptions = [];
    try {
      parsedOptions = JSON.parse(req.body.options || "[]");
    } catch {
      parsedOptions = [];
    }

    /* ==============================
       ✅ PARSE KEY FEATURES
    ============================== */
    let keyFeatures = [];
    try {
      keyFeatures = JSON.parse(req.body.keyFeatures || "[]");
    } catch {
      keyFeatures = [];
    }

    /* ==============================
       ✅ PARSE RATING
    ============================== */
    const rating = Math.min(5, Math.max(0, Number(req.body.rating) || 0));

    const totalReviews = Math.max(0, Number(req.body.totalReviews) || 0);

    /* ==============================
       ✅ IMAGES
    ============================== */
    const imageUrls = req.files?.map((file) => file.path).filter(Boolean) || [];

    /* ==============================
       ✅ CLEAN OPTIONS
    ============================== */
    const cleanedOptions = parsedOptions
      .map((opt) => {
        const values = opt.values
          ?.map((v) => ({
            label: v.label?.trim(),
            price: Number(v.price) || 0,
          }))
          .filter((v) => v.label);

        if (!values || values.length === 0) return null;

        return {
          name: opt.name?.trim() || "Option",
          values,
        };
      })
      .filter(Boolean);

    /* ==============================
       ✅ REMOVE RAW FIELDS
    ============================== */
    const {
      options,
      parentId,
      keyFeatures: _,
      rating: __,
      totalReviews: ___,
      ...rest
    } = req.body;

    const service = new Service({
      ...rest,
      name,
      description: req.body.description || "",
      keyFeatures,

      // ⭐ NEW
      rating,
      totalReviews,

      type: req.body.type || "service",
      parentId: normalizeParentId(parentId),

      pricingType: pricingType || "fixed",
      basePricePerSqft:
        pricingType === "per_sqft" ? Number(basePricePerSqft) || 0 : 0,

      options: cleanedOptions,
      images: imageUrls,
    });

    await service.save();

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* ==============================
   UPDATE SERVICE
================================ */
const updateService = async (req, res) => {
  try {
    /* ==============================
       ✅ PARSE OPTIONS
    ============================== */
    let parsedOptions = [];
    try {
      parsedOptions = JSON.parse(req.body.options || "[]");
    } catch {
      parsedOptions = [];
    }

    /* ==============================
       ✅ PARSE KEY FEATURES
    ============================== */
    let keyFeatures = [];
    try {
      keyFeatures = JSON.parse(req.body.keyFeatures || "[]");
    } catch {
      keyFeatures = [];
    }

    /* ==============================
       ✅ PARSE RATING
    ============================== */
    const rating = Math.min(5, Math.max(0, Number(req.body.rating) || 0));

    const totalReviews = Math.max(0, Number(req.body.totalReviews) || 0);

    /* ==============================
       ✅ NEW IMAGES
    ============================== */
    const imageUrls = req.files?.map((file) => file.path).filter(Boolean) || [];

    /* ==============================
       ✅ EXISTING IMAGES
    ============================== */
    let existingImages = [];
    try {
      existingImages = JSON.parse(req.body.existingImages || "[]");
    } catch {
      existingImages = [];
    }

    const finalImages = [...existingImages, ...imageUrls];

    /* ==============================
       ✅ CLEAN OPTIONS
    ============================== */
    const cleanedOptions = parsedOptions
      .map((opt) => {
        const values = opt.values
          ?.map((v) => ({
            label: v.label?.trim(),
            price: Number(v.price) || 0,
          }))
          .filter((v) => v.label);

        if (!values || values.length === 0) return null;

        return {
          name: opt.name?.trim() || "Option",
          values,
        };
      })
      .filter(Boolean);

    /* ==============================
       ✅ REMOVE RAW FIELDS
    ============================== */
    const {
      options,
      parentId,
      existingImages: _,
      keyFeatures: __,
      rating: ___,
      totalReviews: ____,
      ...rest
    } = req.body;

    const existingService = await Service.findById(req.params.id);

    if (!existingService) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      {
        ...rest,
        description: req.body.description || "",
        keyFeatures,

        // ⭐ NEW
        rating,
        totalReviews,

        type: req.body.type || "service",
        parentId: normalizeParentId(parentId),

        pricingType: req.body.pricingType || "fixed",
        basePricePerSqft:
          req.body.pricingType === "per_sqft"
            ? Number(req.body.basePricePerSqft) || 0
            : 0,

        options: cleanedOptions,
        images: finalImages,
      },
      { new: true, runValidators: true },
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* ==============================
   DELETE SERVICE
================================ */
const deleteService = async (req, res) => {
  try {
    const hasChildren = await Service.findOne({
      parentId: req.params.id,
    });

    if (hasChildren) {
      return res.status(400).json({
        message: "Cannot delete service with sub-services",
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* ==============================
   GET TREE
================================ */
const getServiceTree = async (parentId) => {
  const services = await Service.find({ parentId }).lean();

  for (let service of services) {
    service.children = await getServiceTree(service._id);
  }

  return services;
};

const getServiceWithChildren = async (req, res) => {
  try {
    const objectId = new mongoose.Types.ObjectId(req.params.id);

    const parent = await Service.findById(objectId).lean();

    if (!parent) {
      return res.status(404).json({ message: "Service not found" });
    }

    const children = await getServiceTree(objectId);

    res.json({ parent, children });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createServices,
  updateService,
  deleteService,
  serviceTree: async (req, res) => {
    try {
      const services = await Service.find().lean();

      const buildTree = (data, parentId = null) =>
        data
          .filter((item) => String(item.parentId) === String(parentId))
          .map((item) => ({
            ...item,
            children: buildTree(data, item._id),
          }));

      res.json(buildTree(services));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  getServiceWithChildren,
};
