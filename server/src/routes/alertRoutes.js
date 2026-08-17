import express from "express";
import { getAlertsController } from "../controllers/alertController.js";

const router = express.Router();

router.get("/", getAlertsController);

export default router;
