const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Định nghĩa schema cho Item
const FileSchema = new Schema({
   name: { type: String, required: true },
   driveId: { type: String },
   type: { type: String, required: true },
   parentId: { type: Schema.Types.ObjectId, ref: "files", default: null },
   isRoot: { type: Boolean, default: false },
   ownerId: { type: Schema.Types.ObjectId, ref: "users", required: true },
});

// Tạo model cho Item
const File = mongoose.model("files", FileSchema);

module.exports = File;
