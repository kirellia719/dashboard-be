const express = require("express");
const noteController = require("../controllers/noteController.js");
const authController = require("../controllers/authController.js");

const router = express.Router();

router.use(authController.authenticate);
router.get("/content", noteController.getNote);
router.post("/content", noteController.saveNote);

module.exports = router;
