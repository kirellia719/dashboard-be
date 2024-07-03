const express = require("express");

const authRouter = require("./authRouter.js");
const fileRouter = require("./fileRouter.js");
const noteRouter = require("./noteRouter.js");

const router = express.Router();

router.use("/auth", authRouter);
router.use("/file", fileRouter);
router.use("/note", noteRouter);

module.exports = router;
