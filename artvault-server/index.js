import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import cloudinary from "./utils/cloudinary.js";
import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";
import { authMiddleware } from "./middleware/auth.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const upload = multer({ dest: "uploads/" }); // For handling file uploads

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  await server.start();

  // Upload endpoint for Cloudinary
  app.post("/upload", upload.single("image"), async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path);
      fs.unlinkSync(req.file.path); // Clean up local file
      return res.status(200).json({ url: result.secure_url });
    } catch (err) {
      console.error("Upload Error:", err);
      return res.status(500).json({ error: "Upload failed" });
    }
  });

  // Apply middleware
  app.use(
    "/graphql",
    cors(),
    bodyParser.json(),
    authMiddleware,
    expressMiddleware(server, {
      context: async ({ req }) => ({ user: req.user }),
    })
  );

  // Connect to MongoDB and start server
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      httpServer.listen({ port: process.env.PORT || 4000 }, () => {
        console.log(
          `🚀 Server ready at http://localhost:${
            process.env.PORT || 4000
          }/graphql`
        );
      });
    })
    .catch((err) => console.error("MongoDB connection error:", err));
};

startServer();
