const Service = require("../../models/service");

/* ==============================
   HELPER: Normalize parentId
================================ */
const normalizeParentId = (parentId) => {
  if (!parentId) return null;

  if (Array.isArray(parentId)) {
    return parentId[parentId.length - 1]; // take last value
  }

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

    /* ✅ SAFE PARSE OPTIONS */
    let parsedOptions = [];
    try {
      parsedOptions = JSON.parse(req.body.options || "[]");
    } catch (err) {
      parsedOptions = [];
    }

    /* ✅ IMAGE URLS */
    const imageUrls = req.files?.map((file) => file.path).filter(Boolean) || [];

    /* ✅ CLEAN OPTIONS */
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

    /* ✅ REMOVE RAW FIELDS */
    const { options, parentId, ...rest } = req.body;

    const service = new Service({
      ...rest,
      name,
      type: req.body.type || "service",

      // 🔥 FIXED HERE
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
   FETCH TREE
================================ */
const serviceTree = async (req, res) => {
  try {
    const services = await Service.find().lean();

    const buildTree = (data, parentId = null) => {
      return data
        .filter((item) => String(item.parentId) === String(parentId))
        .map((item) => ({
          ...item,
          children: buildTree(data, item._id),
        }));
    };

    const tree = buildTree(services);

    res.json(tree);
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
    /* ✅ SAFE PARSE */
    let parsedOptions = [];
    try {
      parsedOptions = JSON.parse(req.body.options || "[]");
    } catch (err) {
      parsedOptions = [];
    }

    /* ✅ IMAGE URLS */
    const imageUrls = req.files?.map((file) => file.path).filter(Boolean) || [];

    /* ✅ CLEAN OPTIONS */
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

    /* ✅ REMOVE RAW FIELDS */
    const { options, parentId, ...rest } = req.body;

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
        type: req.body.type || "service",

        // 🔥 FIXED HERE
        parentId: normalizeParentId(parentId),

        pricingType: req.body.pricingType || "fixed",
        basePricePerSqft:
          req.body.pricingType === "per_sqft"
            ? Number(req.body.basePricePerSqft) || 0
            : 0,

        options: cleanedOptions,

        // 🔥 MERGE IMAGES
        ...(imageUrls.length > 0 && {
          images: [...(existingService.images || []), ...imageUrls],
        }),
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

// ==============================
// GET SERVICE WITH CHILDREN
// ==============================
const getServiceWithChildren = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔥 Get parent service
    const parent = await Service.findById(id).lean();

    if (!parent) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    // 🔥 Get children
    const children = await Service.find({ parentId: id }).lean();

    res.json({
      parent,
      children,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
module.exports = {
  createServices,
  serviceTree,
  updateService,
  deleteService,
  getServiceWithChildren,
};
