import supabase from "../config/supabase.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        error: userError?.message,
      });
    }

    // Fetch the user's profile to get their role and vendor_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({
        success: false,
        message: "User profile not found",
        error: profileError?.message,
      });
    }

    // Attach profile to request
    req.user = profile;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
      error: error.message,
    });
  }
};
