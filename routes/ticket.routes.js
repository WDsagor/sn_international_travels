import express from "express";

import {
  createTicket,
  deleteTicket,
  getTickets,
  updateTicket,
} from "../controllers/ticketController.js";
import { verifyToken } from "../Middleware/verifyToken.js";
import { verifyAdmin } from "../Middleware/verifyAdmin.js";

const router = express.Router();

router.get("/", verifyToken, verifyAdmin, getTickets);
router.post("/", verifyToken, verifyAdmin, createTicket);
router.put("/:id", verifyToken, verifyAdmin, updateTicket);
router.delete("/:id", verifyToken, verifyAdmin, deleteTicket);

export default router;
