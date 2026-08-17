import express from "express";

import {
  getShipmentRequests,
  getShipmentRequest,
  createShipmentRequest,
  updateShipmentRequest,
} from "../controllers/shipmentRequestController.js";

const router = express.Router();

router.get("/", getShipmentRequests);
router.post("/", createShipmentRequest);
router.get("/:id", getShipmentRequest);
router.patch("/:id", updateShipmentRequest);

export default router;
