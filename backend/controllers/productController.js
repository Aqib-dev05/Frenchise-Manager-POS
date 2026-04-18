const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const { upload, uploadToCloudinary, deleteFromCloudinary } = require("../middleware/upload");

// @desc    Get all products
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { search, category, brand, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (brand) query.brand = { $regex: brand, $options: "i" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-__v")
      .lean();

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .select("-__v")
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const { name, category, brand, sku, unit, unitPrice, description } = req.body;

    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "products");
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const product = await Product.create({
      name,
      category,
      brand,
      sku,
      unit,
      unitPrice,
      imageUrl,
      imagePublicId,
      description,
    });

    // Auto-create inventory entry
    await Inventory.create({
      product: product._id,
      currentStock: 0,
      minThreshold: 10,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { name, category, brand, sku, unit, unitPrice, description } = req.body;

    if (name) product.name = name;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (sku) product.sku = sku;
    if (unit) product.unit = unit;
    if (unitPrice !== undefined) product.unitPrice = unitPrice;
    if (description !== undefined) product.description = description;

    if (req.file) {
      // Delete old image
      if (product.imagePublicId) {
        await deleteFromCloudinary(product.imagePublicId);
      }
      const result = await uploadToCloudinary(req.file.buffer, "products");
      product.imageUrl = result.secure_url;
      product.imagePublicId = result.public_id;
    }

    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.isActive = false;
    await product.save();

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
