import express from "express";
import { verifyToken } from "../Middleware/verifyToken.js";
import { verifyAdmin } from "../Middleware/verifyAdmin.js";
import { clientLedgerReports } from "../controllers/reportController.js";

const router = express.Router();

router.get("/users/:id", verifyToken, verifyAdmin, clientLedgerReports);

export default router;
