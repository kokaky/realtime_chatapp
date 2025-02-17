import mongoose from "mongoose";

// 连接mongodb数据库方法
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB连接成功:${conn.connection.host}`);
  } catch (error) {
    console.log(`MongoDB连接失败:${error}`);
  }
};
