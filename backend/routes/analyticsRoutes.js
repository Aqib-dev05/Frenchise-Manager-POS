const express = require("express");
const { getDashboard } = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.use(protect);
router.get("/dashboard", authorize("admin"), getDashboard);

module.exports = router;
