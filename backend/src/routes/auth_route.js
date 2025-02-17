// 身份验证的路径
import express from "express";
// 注意这里要写.js后缀
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
} from "../controllers/auth_controller.js";
import { protectRoute } from "../middleware/auth_middleware.js";

const router = express.Router();

// 把请求的具体操作放入controller控制器文件夹中
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
//protectRoute:需要检查用户是否已经登陆、通过了身份认证
router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;
