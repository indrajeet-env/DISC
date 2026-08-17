import express from "express";
import cors from "cors";

import dashboardRoutes from "./routes/dashboardRoutes.js";
import drugRoutes from "./routes/drugRoutes.js";

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

export default app;