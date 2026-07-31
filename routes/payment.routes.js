import express from "express";
import {
  createPayment,
  deletePayment,
  getAllPayments,
  getPaymentById,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/", createPayment);
router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.delete("/:id", deletePayment);

export default router;
