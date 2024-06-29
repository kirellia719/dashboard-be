import { google } from "googleapis";
import credentials from "../key.js";

const rootfolderId = `18c8QVxwWhrBLip7pedS-inL5B6uIEyV3`;

// Configure Google Drive API credentials
const auth = new google.auth.GoogleAuth({
   credentials,
   scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });

const uploadFile = async (req, res) => {
   const { file } = req;
   try {
      const response = await drive.files.create({
         requestBody: {
            name: file.originalname,
            mimeType: file.mimetype,
            parents: [folderId],
         },
         media: {
            mimeType: file.mimetype,
            body: require("fs").createReadStream(file.path),
         },
      });

      res.status(200).json({ fileId: response.data.id });
   } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
   }
};

const getFiles = async (req, res) => {
   try {
      let { folderId } = req.params;
      if (folderId == "root") folderId = rootfolderId;
      const {
         data: { files },
      } = await drive.files.list({
         q: `'${folderId}' in parents`, // Truy vấn các tệp trong thư mục cụ thể
         fields: "files(id, name, mimeType, webContentLink)",
      });
      const parents = await findParent(folderId);
      res.send({
         status: 200,
         data: { files, parents },
      });
   } catch (error) {
      console.error("Error listing files", error);
      res.status(500).send("Failed to list files");
   }
};

const getParents = async (req, res) => {
   const { folderId } = req.params;
   try {
      const parent = await fileParents(folderId);
      res.json(parent);
   } catch (error) {
      console.error("Error retrieving parent folder", error);
      res.status(500).send("Failed to get parent folder");
   }
};

const findParent = async (folderId) => {
   try {
      const { data } = await drive.files.get({
         fileId: folderId,
         fields: "id, name, parents",
      });
      const { id, name, parents } = data;
      if (id == rootfolderId) {
         return [];
      } else {
         const curr = { id, name };
         if (parents && parents.length > 0) {
            const grandparent = await findParent(parents[0]);
            return [...grandparent, curr];
         } else {
            return [curr];
         }
      }
   } catch (error) {}
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

export default { uploadFile, getFiles, getParents, downloadFile };
