const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const noteController = require("../controllers/noteController");

const router = express.Router();

router.get("/", asyncHandler(noteController.listNotes));
router.get("/:id", asyncHandler(noteController.getNote));
router.post("/", asyncHandler(noteController.createNote));
router.put("/:id", asyncHandler(noteController.updateNote));
router.delete("/:id", asyncHandler(noteController.deleteNote));

module.exports = router;
