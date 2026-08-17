import {
  getAllDrugs,
  getDrugById,
  getLowStockDrugs,
} from "../services/drugService.js";

export const getDrugs = async (req, res) => {
  try {
    const drugs = await getAllDrugs();

    res.json({
      success: true,
      count: drugs.length,
      data: drugs,
    });
  } catch (error) {
    console.error("Get drugs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch drugs",
      error: error.message,
    });
  }
};

export const getDrug = async (req, res) => {
  try {
    const drug = await getDrugById(req.params.id);

    res.json({
      success: true,
      data: drug,
    });
  } catch (error) {
    console.error("Get drug error:", error);

    res.status(404).json({
      success: false,
      message: "Drug not found",
      error: error.message,
    });
  }
};

export const getLowStock = async (req, res) => {
  try {
    const drugs = await getLowStockDrugs();

    res.json({
      success: true,
      count: drugs.length,
      data: drugs,
    });
  } catch (error) {
    console.error("Low stock error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch low-stock drugs",
      error: error.message,
    });
  }
};