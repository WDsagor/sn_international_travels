import express from "express";
import {
  createVisaInfo,
  deleteVisaInfo,
  getAllVisaInfo,
  getVisaInfoById,
  updateVisaInfo,
} from "../controllers/visaInfoController.js";
import { verifyAdmin } from "../Middleware/verifyAdmin.js";
import { verifyToken } from "../Middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, verifyAdmin, getAllVisaInfo);
router.post("/", verifyToken, verifyAdmin, createVisaInfo);
router.get("/:id", verifyToken, verifyAdmin, getVisaInfoById);
router.patch("/:id", verifyToken, verifyAdmin, updateVisaInfo);
router.delete("/:id", verifyToken, verifyAdmin, deleteVisaInfo);

export default router;
