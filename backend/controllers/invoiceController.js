const Invoice = require("../models/Invoice");
const Order = require("../models/Order");

// @desc    Get all invoices
// @route   GET /api/invoices
const getInvoices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = {};

    // If salesman, only show own invoices
    let orderFilter = {};
    if (req.user.role === "salesman") {
      const orders = await Order.find({ createdBy: req.user._id }).select("_id");
      const orderIds = orders.map((o) => o._id);
      query.order = { $in: orderIds };
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate({
        path: "order",
        populate: [
          { path: "customer", select: "name phone" },
          { path: "createdBy", select: "name" },
        ],
      })
      .sort({ generatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-__v")
      .lean();

    res.json({
      success: true,
      data: invoices,
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

// @desc    Get invoice by order ID
// @route   GET /api/invoices/:orderId
const getInvoiceByOrder = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({
      order: req.params.orderId,
    }).populate({
      path: "order",
      populate: [
        { path: "customer", select: "name phone address" },
        { path: "createdBy", select: "name email" },
        { path: "items.product", select: "name sku" },
      ],
    })
      .select("-__v")
      .lean();

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInvoices, getInvoiceByOrder };
