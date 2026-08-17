import express from "express";

import {
  getDrugs,
  getDrug,
  getLowStock,
} from "../controllers/drugController.js";

const router = express.Router();

router.get("/", getDrugs);
router.get("/low-stock", getLowStock);
router.get("/:id", getDrug);

export default router;