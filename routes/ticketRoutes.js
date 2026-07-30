import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import {
  createTicket,
  deleteTicket,
  getTickets,
  updateTicket,
} from "../controllers/ticketController.js";

const router = express.Router();

// router.use(verifyToken);

router.get("/", verifyToken, getTickets);
router.post("/", verifyToken, createTicket);
router.put("/:id", verifyToken, updateTicket);
router.delete("/:id", verifyToken, deleteTicket);

export default router;
