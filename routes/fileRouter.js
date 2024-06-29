const express = require("express");
const multer = require("multer");

const fileController = require("../controllers/fileController.js");

const router = express.Router();

const upload = multer();

router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/:folderId", fileController.getFiles);
router.get("/parents/:folderId", fileController.getParents);
router.get("/download/:fileId", fileController.downloadFile);
// router.get("/", fileController.getFiles);

module.exports = router;
