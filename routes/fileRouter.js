const express = require("express");
const multer = require("multer");

const fileController = require("../controllers/fileController.js");
const authController = require("../controllers/authController.js");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/link/:fileId", fileController.getSource);
router.use(authController.authenticate);
router.post("/upload/:folderId", upload.single("file"), fileController.uploadFile);
router.post("/folder/:folderId", fileController.createFolder);
router.post("/rename/:folderId", fileController.renameFolder);
router.delete("/folder/:folderId", fileController.deleteItem);

router.get("/:folderId", fileController.getFiles);
// router.get("/parents/:folderId", fileController.getParents);
router.get("/download/:fileId", fileController.downloadFile);
// router.get("/", fileController.getFiles);

module.exports = router;
