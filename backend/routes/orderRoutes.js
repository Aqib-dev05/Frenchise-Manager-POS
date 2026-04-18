const express = require("express");
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  assignDeliverer,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getOrders)
  .post(authorize("admin", "salesman"), createOrder);

router.route("/:id").get(getOrder);

router.put("/:id/status", authorize("admin", "salesman", "deliverer"), updateOrderStatus);
router.put("/:id/assign", authorize("admin", "salesman"), assignDeliverer);

module.exports = router;
