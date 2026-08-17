import { getAllVendors, getVendorById } from "../services/vendorService.js";

export const getVendors = async (req, res) => {
  try {
    const vendors = await getAllVendors();
    res.json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    console.error("Get vendors error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendors",
      error: error.message,
    });
  }
};

export const getVendor = async (req, res) => {
  try {
    const vendor = await getVendorById(req.params.id);
    res.json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Get vendor error:", error);
    res.status(404).json({
      success: false,
      message: "Vendor not found",
      error: error.message,
    });
  }
};
