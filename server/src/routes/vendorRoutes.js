import express from "express";

import { getVendors, getVendor } from "../controllers/vendorController.js";

const router = express.Router();

router.get("/", getVendors);
router.get("/:id", getVendor);

export default router;
