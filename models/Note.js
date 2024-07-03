const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
   {
      content: { type: String },
      ownerId: { type: String, required: true },
   },
   { timestamps: true }
);

module.exports = mongoose.model("notes", NoteSchema);
