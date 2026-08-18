import express from "express";

import {
  getShipmentRequests,
  getShipmentRequest,
  createShipmentRequest,
  updateShipmentRequest,
} from "../controllers/shipmentRequestController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getShipmentRequests);
router.post("/", authMiddleware, createShipmentRequest);
router.get("/:id", authMiddleware, getShipmentRequest);
router.patch("/:id", authMiddleware, updateShipmentRequest);

export default router;
