const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const StockLog = require("../models/StockLog");
const Invoice = require("../models/Invoice");

// @desc    Get all orders
// @route   GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    // Role-based access
    if (req.user.role === "salesman") {
      query.createdBy = req.user._id;
    } else if (req.user.role === "deliverer") {
      query.assignedTo = req.user._id;
    }

    if (status) query.status = status;

    if (search) {
      query.$or = [{ orderNumber: { $regex: search, $options: "i" } }];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("customer", "name phone address")
      .populate("createdBy", "name")
      .populate("assignedTo", "name")
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: orders,
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

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("items.product", "name sku imageUrl")
      .select("-__v")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Create order
// @route   POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { customer, items, paymentMethod, notes, taxRate } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must have at least one item",
      });
    }

    // Check inventory availability for all items
    for (const item of items) {
      const inventory = await Inventory.findOne({ product: item.product });

      if (!inventory) {
        return res.status(400).json({
          success: false,
          message: `Inventory not found for product: ${item.name}`,
        });
      }

      if (inventory.currentStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Available: ${inventory.currentStock}, Requested: ${item.quantity}`,
        });
      }
    }

    // Deduct inventory for all items
    for (const item of items) {
      await Inventory.findOneAndUpdate(
        { product: item.product },
        {
          $inc: { currentStock: -item.quantity },
          lastUpdated: new Date(),
        }
      );

      await StockLog.create({
        product: item.product,
        type: "out",
        quantity: item.quantity,
        reason: `Order placed`,
        performedBy: req.user._id,
      });
    }

    // Create order
    const order = new Order({
      customer,
      items,
      paymentMethod: paymentMethod || "cash",
      notes: notes || "",
      taxRate: taxRate || 0,
      createdBy: req.user._id,
      status: "pending",
    });

    await order.save();

    // Auto-create invoice
    await Invoice.create({
      order: order._id,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name phone address")
      .populate("createdBy", "name")
      .select("-__v")
      .lean();

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Validate status transitions
    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["in-transit", "cancelled"],
      "in-transit": ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from '${order.status}' to '${status}'`,
      });
    }

    // If cancelling, restore inventory
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        await Inventory.findOneAndUpdate(
          { product: item.product },
          {
            $inc: { currentStock: item.quantity },
            lastUpdated: new Date(),
          }
        );

        await StockLog.create({
          product: item.product,
          type: "in",
          quantity: item.quantity,
          reason: `Order ${order.orderNumber} cancelled - stock restored`,
          performedBy: req.user._id,
        });
      }
    }

    order.status = status;
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign deliverer to order
// @route   PUT /api/orders/:id/assign
const assignDeliverer = async (req, res, next) => {
  try {
    const { delivererId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.assignedTo = delivererId;
    if (order.status === "pending") {
      order.status = "confirmed";
    }
    await order.save();

    const updated = await Order.findById(order._id)
      .populate("customer", "name phone address")
      .populate("assignedTo", "name")
      .select("-__v")
      .lean();

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  assignDeliverer,
};
