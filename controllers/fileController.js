const File = require("../models/File");
const drive = require("../utils/drive");
const stream = require("stream");
const dotenv = require("dotenv");
dotenv.config();

const googleDriveId = process.env.DRIVE_FOLDER_ID;

const uploadFile = async (req, res) => {
   const fileBuffer = req.file.buffer;
   const fileName = req.body.fileName || req.file.originalName;

   try {
      let { folderId } = req.params;
      if (folderId == "root") {
         const rootFolder = await File.findOne({ ownerId: req.user._id });
         folderId = rootFolder._id;
      }
      const fileMetadata = {
         name: fileName,
         mimeType: req.file.mimetype,
         parents: [googleDriveId],
      };

      const media = {
         mimeType: req.file.mimetype,
         body: stream.Readable.from(fileBuffer),
      };

      const { data } = await drive.files.create({
         resource: fileMetadata,
         media: media,
         fields: "id, name, mimeType, webContentLink",
      });

      if (data) {
         function removeFileExtension(filename) {
            // Tìm vị trí của dấu chấm cuối cùng trong tên file
            const lastDotIndex = filename.lastIndexOf(".");

            // Nếu không tìm thấy dấu chấm hoặc dấu chấm nằm ở đầu tên file, trả về tên file gốc
            if (lastDotIndex === -1 || lastDotIndex === 0) {
               return filename;
            }

            // Trả về phần tên file trước dấu chấm cuối cùng
            return filename.substring(0, lastDotIndex);
         }
         let name = fileName.trim();
         name = removeFileExtension(name);
         let fileExists = await File.findOne({ name, parentId: folderId });
         let counter = 1;

         while (fileExists) {
            name = `(${counter}) ${fileName.trim()}`;
            fileExists = await File.findOne({ name, parentId: folderId });
            counter++;
         }
         const file = await File.create({
            name,
            type: req.file.mimetype,
            parentId: folderId,
            ownerId: req.user._id,
            driveId: data.id,
         });
         res.json({ status: 200, data: file });
      } else {
         res.json({ status: 500, message: "Lỗi hệ thống" });
      }
   } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
   }
};

const getFiles = async (req, res) => {
   try {
      let { folderId } = req.params;
      if (folderId == "root") {
         const rootFolder = await File.findOne({ ownerId: req.user._id });
         folderId = rootFolder._id;
      }

      const files = await File.find({ parentId: folderId });

      const parents = await findParent(folderId);
      // const parents = [];
      res.send({
         status: 200,
         data: { files, parents },
      });
   } catch (error) {
      console.error("Error listing files", error);
      res.send({ status: 500, data: [], message: "Lỗi lấy tệp" });
   }
};

const findParent = async (folderId) => {
   try {
      const folder = await File.findById(folderId);
      if (folder) {
         const { _id, name, parentId, isRoot } = folder;
         if (!parentId || isRoot) {
            return [];
         } else {
            const curr = { _id, name };
            const parents = await findParent(parentId);
            return [...parents, curr];
         }
      } else return [];
   } catch (error) {
      return [];
   }
};

const downloadFile = async (req, res) => {
   const { fileId } = req.params; // Lấy ID của tệp từ query parameter

   try {
      // Lấy thông tin về tệp để lấy tên và MIME type
      const file = await drive.files.get({
         fileId,
      });

      res.send(file);
   } catch (error) {}
};

const createFolder = async (req, res) => {
   try {
      let { name } = req.body;
      name = name.trim();
      let { folderId } = req.params;
      if (folderId == "root") {
         const rootFolder = await File.findOne({ ownerId: req.user._id });
         folderId = rootFolder._id;
      }

      const existingFolders = await File.find({
         name,
         type: "folder",
         parentId: folderId,
      });

      if (existingFolders.length > 0) {
         return res.json({
            status: 400,
            message: "Tên thư mục bị trùng",
         });
      } else {
         const folder = await File.create({
            name,
            parentId: folderId,
            type: "folder",
            ownerId: req.user._id,
         });
         res.json({
            status: 200,
            message: "Tạo thư mục thành công",
            data: folder,
         });
      }
   } catch (error) {
      console.log(error);
      res.json({
         status: 500,
         message: "Hệ thống bị lỗi",
      });
   }
};

const removeItem = async (itemId) => {
   try {
      const item = await File.findById(itemId);
      if (item && item.type === "folder") {
         const allChildren = await File.find({ parentId: itemId });
         await Promise.all(allChildren.map((f) => removeItem(f._id)));
      } else {
         await drive.files.delete({
            fileId: item.driveId,
         });
      }
      await File.deleteOne({ _id: itemId });
   } catch (error) {}
};

const deleteItem = async (req, res) => {
   const { folderId } = req.params; // Lấy ID của thư mục từ query parameter
   try {
      await removeItem(folderId);
      res.send({
         status: 200,
         message: "Đã xóa file",
      });
   } catch (error) {
      console.error("Error deleting folder", error);
      res.status(500).send("Failed to delete folder");
   }
};

const getSource = async (req, res) => {
   try {
      let { fileId } = req.params;
      // await drive.permissions.create({
      //    fileId: fileId,
      //    requestBody: {
      //       role: "reader",
      //       type: "anyone",
      //    },
      // });

      // Lấy thông tin tệp để lấy link webContentLink
      const { data } = await drive.files.get({
         fileId: fileId,
         fields: "webContentLink",
      });

      const fileLink = data.webContentLink;

      res.json({ status: 200, data: fileLink });
   } catch (err) {}
};

const renameFolder = async (req, res) => {
   try {
      const { folderId } = req.params;
      let { name } = req.body;
      name = name.trim();
      const file = await File.findById(folderId);
      if (file && name) {
         const checkExists = await File.findOne({ name, parentId: file.parentId });
         if (checkExists) {
            return res.json({
               status: 400,
               message: "Tên thư mục bị trùng",
            });
         } else {
            file.name = name;
            const newFile = await file.save();
            res.json({
               status: 200,
               message: "Đã thay đổi tên thư mục",
               data: newFile,
            });
         }
      } else {
         res.json({
            status: 500,
            message: "Lỗi hệ thống",
         });
      }
   } catch (error) {}
};

const getView = (req, res) => {
   const { fileId } = req.params;
   try {
      res.json({
         status: 200,
         data: `https://drive.google.com/file/d/${fileId}/view`,
      });
   } catch (error) {}
};

module.exports = {
   uploadFile,
   getFiles,
   downloadFile,
   createFolder,
   deleteItem,
   getSource,
   renameFolder,
   getView,
};
