const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const reminderController = require("../controllers/reminderController");

const router = express.Router();

router.get("/", asyncHandler(reminderController.listReminders));
router.post("/", asyncHandler(reminderController.createReminder));
router.delete("/:id", asyncHandler(reminderController.cancelReminder));

module.exports = router;
