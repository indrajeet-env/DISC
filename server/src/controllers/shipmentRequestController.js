import {
  getAllShipmentRequests,
  getShipmentRequestById,
  createShipmentRequest as createShipmentRequestService,
  updateShipmentRequest as updateShipmentRequestService,
} from "../services/shipmentRequestService.js";

export const getShipmentRequests = async (req, res) => {
  try {
    const requests = await getAllShipmentRequests();
    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Get shipment requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shipment requests",
      error: error.message,
    });
  }
};

export const getShipmentRequest = async (req, res) => {
  try {
    const request = await getShipmentRequestById(req.params.id);
    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Get shipment request error:", error);
    res.status(404).json({
      success: false,
      message: "Shipment request not found",
      error: error.message,
    });
  }
};

export const createShipmentRequest = async (req, res) => {
  try {
    const { drug_id, vendor_id, requested_quantity, hospital_id } = req.body;

    if (!drug_id || !vendor_id || !requested_quantity || !hospital_id) {
      return res.status(400).json({
        success: false,
        message: "drug_id, vendor_id, requested_quantity, and hospital_id are required",
      });
    }

    const newRequest = await createShipmentRequestService({
      drug_id,
      vendor_id,
      hospital_id,
      requested_quantity: parseInt(requested_quantity, 10),
    });

    res.status(201).json({
      success: true,
      data: newRequest,
    });
  } catch (error) {
    console.error("CREATE SHIPMENT REQUEST ERROR:", error);
    console.error("MESSAGE:", error.message);
    console.error("DETAILS:", error.details);
    console.error("HINT:", error.hint);
    console.error("CODE:", error.code);

    res.status(500).json({
      success: false,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
  }
};

export const updateShipmentRequest = async (req, res) => {
  try {
    const allowedStatuses = ["REQUESTED", "ACKNOWLEDGED", "REJECTED", "CANCELLED"];
    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const updatedRequest = await updateShipmentRequestService(req.params.id, req.body);
    res.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Update shipment request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update shipment request",
      error: error.message,
    });
  }
};
