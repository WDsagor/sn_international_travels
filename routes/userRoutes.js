import express from "express";
import {
  createUser,
  getAllUsers,
  loginUser,
} from "../controllers/authController.js";
import { verifyToken } from "../Middleware/verifytoken.js";

const router = express.Router();

router.post("/", createUser);
router.post("/login", loginUser);
router.get("/", verifyToken, getAllUsers);

export default router;
