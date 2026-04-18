const Order = require("../models/Order");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const User = require("../models/User");

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Total revenue (delivered orders)
    const revenueResult = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Order counts
    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });
    const ordersThisWeek = await Order.countDocuments({
      createdAt: { $gte: weekStart },
    });
    const ordersThisMonth = await Order.countDocuments({
      createdAt: { $gte: monthStart },
    });
    const totalOrders = await Order.countDocuments();

    // Top 5 products by quantity sold
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          totalQty: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] },
          },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    // Revenue by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueByDay = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$grandTotal" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Low stock count
    const lowStockCount = await Inventory.countDocuments({
      $expr: { $lte: ["$currentStock", "$minThreshold"] },
    });

    // Active users count
    const activeUsers = await User.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        totalRevenue,
        ordersToday,
        ordersThisWeek,
        ordersThisMonth,
        totalOrders,
        topProducts,
        revenueByDay,
        ordersByStatus,
        lowStockCount,
        activeUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
