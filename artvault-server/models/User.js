// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  credits: { type: Number, default: 2000 },
});

export default mongoose.model("User", userSchema);
