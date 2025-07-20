import express from "express";

import authRoutes from "../handlers/auth/auth.routes.js";
import blogRoutes from "../handlers/blog/blog.routes.js";

const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/blog", blogRoutes);

export default router;
