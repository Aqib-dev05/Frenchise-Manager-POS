const express = require("express");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getProducts)
  .post(authorize("admin"), upload.single("image"), createProduct);

router
  .route("/:id")
  .get(getProduct)
  .put(authorize("admin"), upload.single("image"), updateProduct)
  .delete(authorize("admin"), deleteProduct);

module.exports = router;
