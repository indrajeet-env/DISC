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

export const createDrug = async (req, res) => {
  try {
    const newDrug = await import("../services/drugService.js").then(m => m.createDrug(req.body));
    res.status(201).json({
      success: true,
      data: newDrug,
    });
  } catch (error) {
    console.error("Create drug error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create drug",
      error: error.message,
    });
  }
};

export const updateDrug = async (req, res) => {
  try {
    const updatedDrug = await import("../services/drugService.js").then(m => m.updateDrug(req.params.id, req.body));
    res.json({
      success: true,
      data: updatedDrug,
    });
  } catch (error) {
    console.error("Update drug error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update drug",
      error: error.message,
    });
  }
};

export const deleteDrug = async (req, res) => {
  try {
    await import("../services/drugService.js").then(m => m.deleteDrug(req.params.id));
    res.json({
      success: true,
      message: "Drug deleted successfully",
    });
  } catch (error) {
    console.error("Delete drug error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete drug",
      error: error.message,
    });
  }
};