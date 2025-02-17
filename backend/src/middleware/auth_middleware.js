import jwt from "jsonwebtoken";
import User from "../models/user_model.js";

// next就是放行去调用下一个方法
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    // 1.判断是否有token
    if (!token) {
      return res.status(401).json({ message: "认证失败——没有token信息" });
    }

    // 2.解析token，判断是否有效
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res
        .status(401)
        .json({ message: "认证失败——token失效，请重新登陆" });
    }

    // 3.token有效，根据解析出来的内容用户ID 到数据库中查找用户，判断是否还存在该用户（除去password字段值）
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "用户未找到" });
    }

    // 4.存在该用户——将用户信息添加到请求当中，以便后续的请求处理中能够获取到用户信息
    req.user = user;
    next();
  } catch (error) {
    console.log("错误发生在protectRoute中间件:", error.message);
    res.status(500).json({ message: "内部服务错误" });
  }
};
