import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";

import router from "./routes/index.js";

const app = express();

// CONFIG
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(morgan("short"));

// ROUTES
app.use("/", router);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Running: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
