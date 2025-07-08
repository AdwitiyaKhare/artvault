// models/Art.js
import mongoose from "mongoose";

const artSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  price: Number,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sold: { type: Boolean, default: false },
});

export default mongoose.model("Art", artSchema);
