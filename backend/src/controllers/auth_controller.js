import bcryptjs, { hash } from "bcryptjs";
import User from "../models/user_model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "所有字段都不能为空" });
    }

    //使用bcryptjs对密码进行hash
    if (password.length < 6) {
      return res.status(400).json({ message: "密码必须6个字符及以上" });
    }
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "邮箱已经存在" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    // 通过mongodb的UserModel创建一个user对象
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      //生成jwt Token——调用utils.js工具文件中的方法生成jwt
      generateToken(newUser._id, res); //传递res过去可以设置res中的cookie
      await newUser.save(); // 保存到数据库
      res.status(201).json({
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ message: "无效的用户数据" });
    }
  } catch (error) {
    console.log("登陆控制器出错", error.message);
    res.status(500).json({ message: "内部服务器错误" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "信息错误" }); // 给出通用错误信息，防止是恶意用户
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "信息错误" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("login登陆出错:", error.message);
    res.status(500).json({ message: "服务端出错，请稍后再试！" });
  }
};

export const logout = (req, res) => {
  // 退出登陆只需要清除cookie中的jwt
  try {
    res.cookie("jwt", { maxAge: 0 });
    res.status(200).json({ message: "退出成功！" });
  } catch (error) {
    console.log("logout退出登陆出错:", error.message);
    res.status(500).json({ message: "服务端出错，请稍后再试" });
  }
};

// 使用Cloud Nary服务 提供的图片存储服务
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({ message: "请上传图像" });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    //更新数据库中的用户信息,设置new:true，则返回更新后的对象，否则是更新前的
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("错误发生在更新图像处:", error.message);
    res.status(500).json("服务错误");
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("错误发生在checkAuth服务:", error.message);
    res.status(500).json({ message: "服务错误" });
  }
};
