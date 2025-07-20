import express from "express";
import {
  getPosts,
  getPost,
  createPost,
  generatePostWithAI,
} from "./blog.controller.js";
import { authenticateToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Public routes - no authentication required
router.get("/", getPosts);
router.get("/:id", getPost);

// Protected routes - authentication required
router.post("/", authenticateToken, createPost);
router.post("/generate-ai", authenticateToken, generatePostWithAI);

export default router;
