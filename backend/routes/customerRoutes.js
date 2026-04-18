const express = require("express");
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
} = require("../controllers/customerController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(authorize("admin", "salesman"), getCustomers)
  .post(authorize("admin", "salesman"), createCustomer);

router
  .route("/:id")
  .get(authorize("admin", "salesman"), getCustomer)
  .put(authorize("admin", "salesman"), updateCustomer);

module.exports = router;
