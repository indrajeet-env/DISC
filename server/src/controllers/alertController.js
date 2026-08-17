import { getAlerts } from "../services/alertService.js";
import { getHospitalForAccessToken } from "../services/procurementDataService.js";

export const getAlertsController = async (req, res) => {
  try {
    const authorization = req.get("authorization") || "";
    const accessToken = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    let hospitalId = null;
    if (accessToken) {
      // Optional: Get hospital scope if authenticated
      try {
        hospitalId = await getHospitalForAccessToken(accessToken);
      } catch (e) {
        console.error("Auth error fetching hospital ID for alerts:", e.message);
      }
    }

    const alerts = await getAlerts(hospitalId);
    
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch alerts" });
  }
};
