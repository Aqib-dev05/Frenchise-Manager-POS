const Inventory = require("../models/Inventory");
const StockLog = require("../models/StockLog");
const { generateCSV } = require("../utils/csvExport");

// @desc    Get all inventory
// @route   GET /api/inventory
const getInventory = async (req, res, next) => {
  try {
    const { search, lowStock, page = 1, limit = 10 } = req.query;
    const query = {};

    let inventoryQuery = Inventory.find(query)
      .populate({
        path: "product",
        match: { isActive: true },
        select: "name category brand sku unit unitPrice imageUrl",
      })
      .select("-__v")
      .sort({ lastUpdated: -1 })
      .lean();

    const allInventory = await inventoryQuery;

    // Filter out null products (inactive), apply search
    let filtered = allInventory.filter((inv) => inv.product !== null);

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.product.name.toLowerCase().includes(searchLower) ||
          inv.product.sku.toLowerCase().includes(searchLower) ||
          inv.product.brand.toLowerCase().includes(searchLower)
      );
    }

    if (lowStock === "true") {
      filtered = filtered.filter(
        (inv) => inv.currentStock <= inv.minThreshold
      );
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + parseInt(limit));

    res.json({
      success: true,
      data: paginated,
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

// @desc    Update inventory thresholds
// @route   PUT /api/inventory/:productId
const updateInventory = async (req, res, next) => {
  try {
    const { minThreshold } = req.body;

    const inventory = await Inventory.findOne({
      product: req.params.productId,
    }).populate("product", "name sku");

    if (!inventory) {
      return res.status(404).json({ success: false, message: "Inventory record not found" });
    }

    if (minThreshold !== undefined) inventory.minThreshold = minThreshold;
    inventory.lastUpdated = new Date();

    await inventory.save();

    res.json({ success: true, data: inventory });
  } catch (error) {
    next(error);
  }
};

// @desc    Stock In - receive new stock
// @route   POST /api/inventory/stock-in
const stockIn = async (req, res, next) => {
  try {
    const { productId, quantity, supplierName, costPrice, reason } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product ID and positive quantity are required",
      });
    }

    const inventory = await Inventory.findOne({ product: productId });

    if (!inventory) {
      return res.status(404).json({ success: false, message: "Inventory record not found" });
    }

    inventory.currentStock += parseInt(quantity);
    inventory.lastUpdated = new Date();
    await inventory.save();

    // Create stock log
    await StockLog.create({
      product: productId,
      type: "in",
      quantity: parseInt(quantity),
      reason: reason || "Stock received",
      supplierName: supplierName || "",
      costPrice: costPrice || 0,
      performedBy: req.user._id,
    });

    const updated = await Inventory.findOne({ product: productId }).populate(
      "product",
      "name sku"
    );

    res.json({ success: true, data: updated, message: "Stock updated successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock logs
// @route   GET /api/inventory/logs
const getStockLogs = async (req, res, next) => {
  try {
    const { productId, type, page = 1, limit = 20 } = req.query;
    const query = {};

    if (productId) query.product = productId;
    if (type) query.type = type;

    const total = await StockLog.countDocuments(query);
    const logs = await StockLog.find(query)
      .populate("product", "name sku")
      .populate("performedBy", "name role")
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: logs,
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

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock
const getLowStock = async (req, res, next) => {
  try {
    const inventory = await Inventory.find({
      $expr: { $lte: ["$currentStock", "$minThreshold"] },
    })
      .populate("product", "name sku brand category imageUrl")
      .select("-__v")
      .lean();

    const filtered = inventory.filter((inv) => inv.product !== null);

    res.json({ success: true, data: filtered, count: filtered.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Export inventory as CSV
// @route   GET /api/inventory/export-csv
const exportCSV = async (req, res, next) => {
  try {
    const inventory = await Inventory.find()
      .populate("product", "name category brand sku unit unitPrice")
      .select("-__v")
      .lean();

    const filtered = inventory.filter((inv) => inv.product !== null);

    const headers = [
      { id: "name", title: "Product Name" },
      { id: "sku", title: "SKU" },
      { id: "brand", title: "Brand" },
      { id: "category", title: "Category" },
      { id: "unit", title: "Unit" },
      { id: "unitPrice", title: "Unit Price" },
      { id: "currentStock", title: "Current Stock" },
      { id: "minThreshold", title: "Min Threshold" },
    ];

    const data = filtered.map((inv) => ({
      name: inv.product.name,
      sku: inv.product.sku,
      brand: inv.product.brand,
      category: inv.product.category,
      unit: inv.product.unit,
      unitPrice: inv.product.unitPrice,
      currentStock: inv.currentStock,
      minThreshold: inv.minThreshold,
    }));

    const csv = generateCSV(headers, data);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=inventory_${new Date().toISOString().slice(0, 10)}.csv`
    );
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  updateInventory,
  stockIn,
  getStockLogs,
  getLowStock,
  exportCSV,
};
