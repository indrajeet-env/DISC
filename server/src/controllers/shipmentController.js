import {
  getAllShipments,
  getShipmentById,
  createShipment as createShipmentService,
  updateShipment as updateShipmentService,
  deleteShipment as deleteShipmentService
} from "../services/shipmentService.js";

export const getShipments = async (req, res) => {
  try {
    const shipments = await getAllShipments();
    res.json({
      success: true,
      count: shipments.length,
      data: shipments,
    });
  } catch (error) {
    console.error("Get shipments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shipments",
      error: error.message,
    });
  }
};

export const getShipment = async (req, res) => {
  try {
    const shipment = await getShipmentById(req.params.id);
    res.json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    console.error("Get shipment error:", error);
    res.status(404).json({
      success: false,
      message: "Shipment not found",
      error: error.message,
    });
  }
};

export const createShipment = async (req, res) => {
  try {
    const newShipment = await createShipmentService(req.body);
    res.status(201).json({
      success: true,
      data: newShipment,
    });
  } catch (error) {
    console.error("Create shipment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create shipment",
      error: error.message,
    });
  }
};

export const updateShipment = async (req, res) => {
  try {
    const updatedShipment = await updateShipmentService(req.params.id, req.body);
    res.json({
      success: true,
      data: updatedShipment,
    });
  } catch (error) {
    console.error("Update shipment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update shipment",
      error: error.message,
    });
  }
};

export const deleteShipment = async (req, res) => {
  try {
    await deleteShipmentService(req.params.id);
    res.json({
      success: true,
      message: "Shipment deleted successfully",
    });
  } catch (error) {
    console.error("Delete shipment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete shipment",
      error: error.message,
    });
  }
};
