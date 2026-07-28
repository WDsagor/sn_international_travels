import express from "express";
import { verifyToken } from "../Middleware/verifyToken";
import { verifyAdmin } from "../Middleware/verifyAdmin";
import {
  createClient,
  deleteClient,
  getAllClients,
  getClientById,
  updateClient,
} from "../controllers/clientController";

// import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// সব প্রটেক্টেড রাউট (লগইন করা ইউজার দেখতে পারবে)
router.get("/", verifyToken, getAllClients);
router.get("/:id", verifyToken, getClientById);
router.post("/", verifyToken, createClient);

// আপডেট ও ডিলিট শুধু Admin করতে পারবে
router.put("/:id", verifyToken, verifyAdmin, updateClient);
router.delete("/:id", verifyToken, verifyAdmin, deleteClient);

export default router;
