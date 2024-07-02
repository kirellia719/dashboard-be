const User = require("../models/User.js");
const File = require("../models/File.js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const login = async (req, res) => {
   try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (user) {
         if (user.password === password) {
            const { password, ...otherInfo } = user._doc;
            const token = jwt.sign({ ...otherInfo }, process.env.JWT_SECRET, {
               expiresIn: "10m",
            });
            res.json({
               status: 200,
               message: "Login Success",
               data: token,
            });
         } else {
            res.json({
               status: 400,
               message: "Mật khẩu không đúng",
            });
         }
      } else {
         res.json({
            status: 400,
            message: "Tài khoản không tồn tại",
         });
      }
   } catch (error) {
      res.json(error);
   }
};

const register = async (req, res) => {
   try {
      const { username, password, email } = req.body;
      const findWithUser = await User.findOne({ username });
      const findWithEmail = await User.findOne({ email });
      if (findWithUser || findWithEmail) {
         res.json({
            status: 400,
            message: "Tài khoản hoặc Email đã tồn tại",
         });
      } else {
         const newUser = new User({
            username,
            password,
            email,
         });
         const user = await newUser.save();

         if (user) {
            const rootFolder = new File({
               name: username,
               type: "folder",
               isRoot: true,
               ownerId: user._id,
            });
            await rootFolder.save();

            res.json({
               status: 200,
               message: "Đăng ký thành công",
            });
         } else {
            try {
               if (user && user._id) {
                  await user.delete();
               }
            } catch (error) {}
            res.json({
               status: 500,
               message: "Lỗi hệ thống",
            });
         }
      }
   } catch (error) {
      console.log(error);
      res.json({ status: 500, message: "Lỗi hệ thống" });
   }
};

const getCurrentUser = async (req, res) => {
   try {
      const token = req.headers.authorization.split(" ")[1];
      try {
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         res.json({
            status: 200,
            message: "Đăng nhập thành công",
            data: decoded,
         });
      } catch (error) {
         res.json({
            status: 401,
            message: "Token hết hạn",
            error: error,
         });
      }
   } catch (error) {
      res.json({
         status: 500,
         message: "Hệ thống lỗi",
      });
   }
};

const authenticate = (req, res, next) => {
   try {
      let token;
      if (req.headers.authorization) {
         token = req.headers.authorization.split(" ")[1];
      } else {
         res.json({ status: 401, message: "Không thể xác minh người dùng" });
      }
      try {
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         req.user = decoded;
         next();
      } catch (error) {
         res.json({
            status: 401,
            message: "Token hết hạn",
            error: error,
         });
      }
   } catch (error) {
      console.log("authenticate", error);
      res.json({
         status: 500,
         message: "Hệ thống lỗi",
      });
   }
};

module.exports = { login, register, getCurrentUser, authenticate };
