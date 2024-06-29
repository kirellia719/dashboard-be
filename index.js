const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

const router = require("./routes/index.js");

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
