import { getHospitalForAccessToken } from "../services/procurementDataService.js";
import { answerProcurementQuestion } from "../services/procurementAssistantService.js";

export const postChat = async (req, res) => {
  console.log("\n========== CHAT REQUEST ==========");

  try {
    console.log("1. Request reached controller");

    const message = String(req.body?.message || "").trim();
    console.log("2. Message:", message);

    if (!message || message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message must be between 1 and 2000 characters.",
      });
    }

    const authorization = req.get("authorization") || "";
    console.log("3. Authorization exists:", Boolean(authorization));

    const accessToken = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "A signed-in session is required.",
      });
    }

    console.log("4. Resolving hospital...");

    const hospitalId = await getHospitalForAccessToken(accessToken);

    console.log("5. Hospital resolved:", hospitalId);
    console.log("6. Calling procurement assistant...");

    const result = await answerProcurementQuestion({
      hospitalId,
      message,
    });

    console.log("7. Procurement assistant succeeded");

    return res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("\n========== CHAT ERROR ==========");
    console.error("MESSAGE:", error?.message);
    console.error("STATUS:", error?.status);
    console.error("STACK:", error?.stack);
    console.error("FULL ERROR:", error);

    return res.status(error?.status || 500).json({
      success: false,
      message:
        error?.message ||
        "Unable to answer the procurement question right now.",
    });
  }
};