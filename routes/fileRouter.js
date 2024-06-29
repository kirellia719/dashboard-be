import express from "express";
import multer from "multer";

import fileController from "../controllers/fileController.js";

const router = express.Router();

const upload = multer();

router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/:folderId", fileController.getFiles);
router.get("/parents/:folderId", fileController.getParents);
router.get("/download/:fileId", fileController.downloadFile);
// router.get("/", fileController.getFiles);

export default router;
