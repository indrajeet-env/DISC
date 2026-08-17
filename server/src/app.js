import express from "express";
import cors from "cors";

import dashboardRoutes from "./routes/dashboardRoutes.js";
import drugRoutes from "./routes/drugRoutes.js";
import shipmentRoutes from "./routes/shipmentRoutes.js";
import shipmentRequestRoutes from "./routes/shipmentRequestRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Drug Supply Chain API is running",
  });
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/drugs", drugRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/shipment-requests", shipmentRequestRoutes);
app.use("/api/vendors", vendorRoutes);

export default app;