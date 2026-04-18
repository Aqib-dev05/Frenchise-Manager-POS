const express = require("express");
const { getInvoices, getInvoiceByOrder } = require("../controllers/invoiceController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getInvoices);
router.get("/:orderId", getInvoiceByOrder);

module.exports = router;
