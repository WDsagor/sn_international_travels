import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  loginUser,
  updateUser,
} from "../controllers/authController.js";
import { verifyToken } from "../Middleware/verifyToken.js";
import { verifyAdmin } from "../Middleware/verifyAdmin.js";

const router = express.Router();

router.post("/", createUser);
router.post("/login", loginUser);
router.get("/", verifyToken, getAllUsers);

router.put("/:id", verifyToken, verifyAdmin, updateUser); // or router.patch
router.delete("/:id", verifyToken, verifyAdmin, deleteUser);

export default router;
