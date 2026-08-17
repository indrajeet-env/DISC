import { getDashboardData } from "../services/dashboardService.js";

export const getDashboard = async (req, res) => {
  try {
    const dashboardData = await getDashboardData();

    res.json({
      success: true,
      ...dashboardData,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};