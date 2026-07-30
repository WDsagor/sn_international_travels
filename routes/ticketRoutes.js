import express from "express";

import {
  createTicket,
  deleteTicket,
  getTickets,
  updateTicket,
} from "../controllers/ticketController.js";
import { verifyToken } from "../Middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getTickets);
router.post("/", verifyToken, createTicket);
router.put("/:id", verifyToken, updateTicket);
router.delete("/:id", verifyToken, deleteTicket);

export default router;
