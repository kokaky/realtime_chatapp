import User from "../models/user_model.js";
import Message from "../models/message_model.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    // 由于之前经过了protectRoute，因此req中肯定会有user
    const loggedInUserId = req.user._id;
    //从数据库中获取用户ID不为当前登陆用户ID 的用户，并且不能获取密码
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("getUsersForSidebar部分服务出错", error.message);
    res.status(500).json({ error: "服务错误，请稍后再试" });
  }
};

// 获取对应用户的消息
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("错误发生在getMessages Controller中:", error.message);
    res.status(500).json({ error: "服务器错误,请稍后再试！" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const myId = req.user._id;

    let imageUrl;

    if (image) {
      // 如果有图片，则现将图片传到cloudinary上
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId: myId,
      receiverId: receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // TODO: 使用socket.io实现实时发送功能 稍后实现

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("错误发生在sendMessage controller:", error.message);
    res.status(500).json({ error: "服务端错误，请稍后再试" });
  }
};
