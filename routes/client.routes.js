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

router.get("/", verifyToken, getAllClients);
router.get("/:id", verifyToken, getClientById);
router.post("/", verifyToken, createClient);

router.put("/:id", verifyToken, verifyAdmin, updateClient);
router.delete("/:id", verifyToken, verifyAdmin, deleteClient);

export default router;
