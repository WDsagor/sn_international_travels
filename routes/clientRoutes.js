import express from "express";

import {
  createClient,
  deleteClient,
  getAllClients,
  getClientById,
  updateClient,
} from "../controllers/clientController.js";
import { verifyToken } from "../Middleware/verifyToken.js";
import { verifyAdmin } from "../Middleware/verifyAdmin.js";

const router = express.Router();

// সব প্রটেক্টেড রাউট (লগইন করা ইউজার দেখতে পারবে)
router.get("/", verifyToken, getAllClients);
router.get("/:id", verifyToken, getClientById);
router.post("/", verifyToken, createClient);

// আপডেট ও ডিলিট শুধু Admin করতে পারবে
router.put("/:id", verifyToken, verifyAdmin, updateClient);
router.delete("/:id", verifyToken, verifyAdmin, deleteClient);

export default router;
