import { answerProcurementQuestion } from "../services/procurementAssistantService.js";

export const postChat = async (req, res) => {
  console.log("\n========== CHAT REQUEST ==========");

  try {
    const message = String(req.body?.message || "").trim();

    if (!message || message.length > 2000) {
      return res.status(400).json({
        success: false,
        message:
          "Message must be between 1 and 2000 characters.",
      });
    }

    const history = Array.isArray(req.body?.history)
      ? req.body.history
          .filter(
            (item) =>
              item &&
              (item.role === "user" ||
                item.role === "assistant") &&
              typeof item.content === "string"
          )
          .slice(-10)
      : [];

    const authorization =
      req.get("authorization") || "";

    const accessToken = authorization.startsWith(
      "Bearer "
    )
      ? authorization.slice(7)
      : null;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "A signed-in session is required.",
      });
    }

    console.log(
      "Chat request received. History messages:",
      history.length
    );

    // Chatbot no longer queries hospital/profile/Supabase data.
    // Authentication is only used to ensure the user is signed in.
    const result = await answerProcurementQuestion({
      message,
      history,
    });

    console.log("Procurement assistant succeeded");

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("\n========== CHAT ERROR ==========");
    console.error("MESSAGE:", error?.message);
    console.error("STATUS:", error?.status);
    console.error("STACK:", error?.stack);

    return res.status(error?.status || 500).json({
      success: false,
      message:
        error?.message ||
        "Unable to answer the procurement question right now.",
    });
  }
};