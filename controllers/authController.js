import User from "../models/User.js";

import jwt from "jsonwebtoken";

const login = async (req, res) => {
   try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (user) {
         if (user.password === password) {
            const { password, ...otherInfo } = user._doc;
            const token = jwt.sign({ ...otherInfo }, process.env.JWT_SECRET, {
               expiresIn: "30m",
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
         const result = await newUser.save();
         res.json({
            status: 200,
            message: "Đăng ký thành công",
            data: result,
         });
      }
   } catch (error) {
      res.error(error);
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

export default { login, register, getCurrentUser };
