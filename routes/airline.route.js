import express from "express";
import {
  createAirline,
  deleteAirline,
  getAllAirlines,
  updateAirline,
} from "../controllers/airlineController.js";
const router = express.Router();

router.get("/", getAllAirlines);
router.post("/", createAirline);
router.patch("/:id", updateAirline);
router.delete("/:id", deleteAirline);

export default router;
