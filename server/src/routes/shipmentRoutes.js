import express from "express";

import {
  getShipments,
  getShipment,
} from "../controllers/shipmentController.js";

const router = express.Router();

router.get("/", getShipments);
router.get("/:id", getShipment);

export default router;
