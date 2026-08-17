import express from "express";

import {
  getDrugs,
  getDrug,
  getLowStock,
  createDrug,
  updateDrug,
  deleteDrug
} from "../controllers/drugController.js";

const router = express.Router();

router.get("/", getDrugs);
router.post("/", createDrug);
router.get("/low-stock", getLowStock);
router.get("/:id", getDrug);
router.patch("/:id", updateDrug);
router.delete("/:id", deleteDrug);

export default router;