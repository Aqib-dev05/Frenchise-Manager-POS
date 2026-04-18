const express = require("express");
const {
  getInventory,
  updateInventory,
  stockIn,
  getStockLogs,
  getLowStock,
  exportCSV,
} = require("../controllers/inventoryController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.use(protect);

router.get("/", getInventory);
router.get("/logs", getStockLogs);
router.get("/low-stock", getLowStock);
router.get("/export-csv", authorize("admin"), exportCSV);
router.post("/stock-in", authorize("admin"), stockIn);
router.put("/:productId", authorize("admin"), updateInventory);

module.exports = router;
