import { getHospitalForAccessToken } from "../services/procurementDataService.js";
import { answerProcurementQuestion } from "../services/procurementAssistantService.js";

export const postChat = async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();
    if (!message || message.length > 2000) {
      return res.status(400).json({ success: false, message: "Message must be between 1 and 2000 characters." });
    }

    const authorization = req.get("authorization") || "";
    const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!accessToken) {
      return res.status(401).json({ success: false, message: "A signed-in session is required." });
    }

    const hospitalId = await getHospitalForAccessToken(accessToken);
    const result = await answerProcurementQuestion({ hospitalId, message });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Procurement chat error:", error.message);
    res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Unable to answer the procurement question right now.",
    });
  }
};
