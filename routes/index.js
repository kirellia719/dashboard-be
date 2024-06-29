const express = require("express");

const authRouter = require("./authRouter.js");
const fileRouter = require("./fileRouter.js");

const router = express.Router();

router.use("/auth", authRouter);
router.use("/file", fileRouter);

module.exports = router;
