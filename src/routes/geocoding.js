const express = require("express");
const router = express.Router();
const geocodingController = require("../controllers/geocodingController");
const { authenticate } = require("../middleware/auth");
const { createLimiter } = require("../middleware/rateLimiter");

router.use(authenticate);

router.post(
  "/",
  createLimiter(15 * 60 * 1000, 50),
  geocodingController.geocode
);

module.exports = router;
