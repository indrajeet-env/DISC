import express from "express";

import {
  getShipments,
  getShipment,
  createShipment,
  updateShipment,
  deleteShipment
} from "../controllers/shipmentController.js";

const router = express.Router();

router.get("/", getShipments);
router.post("/", createShipment);
router.get("/:id", getShipment);
router.patch("/:id", updateShipment);
router.delete("/:id", deleteShipment);

export default router;
