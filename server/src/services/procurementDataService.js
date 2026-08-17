import supabase from "../config/supabase.js";

const MAX_ROWS = 20;

const requireData = ({ data, error }) => {
  if (error) throw error;
  return data || [];
};

const shipmentSelect = `
  id, drug_id, vendor_id, hospital_id, quantity, expected_quantity, status,
  expected_delivery, actual_delivery, temperature,
  drugs ( name ), vendors ( name )
`;

const requestSelect = `
  id, drug_id, vendor_id, hospital_id, requested_quantity, status,
  requested_at, acknowledged_at,
  drugs ( name ), vendors ( name )
`;

const compactShipment = (shipment) => ({
  id: shipment.id,
  drug_id: shipment.drug_id,
  drug_name: shipment.drugs?.name || "Unknown Drug",
  vendor_id: shipment.vendor_id,
  vendor_name: shipment.vendors?.name || "Unknown Vendor",
  quantity: shipment.quantity,
  expected_quantity: shipment.expected_quantity,
  status: shipment.status,
  expected_delivery: shipment.expected_delivery,
  actual_delivery: shipment.actual_delivery,
  temperature: shipment.temperature,
});

const compactRequest = (request) => ({
  id: request.id,
  drug_id: request.drug_id,
  drug_name: request.drugs?.name || "Unknown Drug",
  vendor_id: request.vendor_id,
  vendor_name: request.vendors?.name || "Unknown Vendor",
  requested_quantity: request.requested_quantity,
  status: request.status,
  requested_at: request.requested_at,
  acknowledged_at: request.acknowledged_at,
});

import { createClient } from "@supabase/supabase-js";

export const getHospitalForAccessToken = async (accessToken) => {
  const { data: authData, error: authError } =
    await supabase.auth.getUser(accessToken);

  console.log("=== AUTH DEBUG ===");
  console.log("authError:", authError);
  console.log("user:", authData?.user?.id);

  if (authError || !authData?.user) {
    const error = new Error("Invalid or expired session");
    error.status = 401;
    throw error;
  }

  const userId = authData.user.id;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, hospital_id, role")
    .eq("id", userId)
    .maybeSingle();

  console.log("=== PROFILE DEBUG ===");
  console.log("userId:", userId);
  console.log("profile:", profile);
  console.log("profileError:", profileError);

  if (profileError) {
    const error = new Error(
      `Profile lookup failed: ${profileError.message}`
    );
    error.status = 500;
    throw error;
  }

  if (!profile) {
    const error = new Error(
      `No profile found for authenticated user ${userId}`
    );
    error.status = 403;
    throw error;
  }

  if (!profile.hospital_id) {
    const error = new Error(
      `Profile exists but hospital_id is missing for user ${userId}`
    );
    error.status = 403;
    throw error;
  }

  console.log("=== HOSPITAL RESOLVED ===");
  console.log("hospitalId:", profile.hospital_id);

  return profile.hospital_id;
};

export const getHospitalInventory = async (hospitalId) => {
  const rows = requireData(
    await supabase
      .from("drugs")
      .select("id, name, category, unit, current_stock, minimum_stock, expiry_date")
      .eq("hospital_id", hospitalId)
      .order("current_stock")
      .limit(MAX_ROWS)
  );

  return rows.map((drug) => ({
    ...drug,
    shortage: Math.max(Number(drug.minimum_stock || 0) - Number(drug.current_stock || 0), 0),
    stock_ratio: drug.minimum_stock
      ? Number((Number(drug.current_stock || 0) / Number(drug.minimum_stock)).toFixed(2))
      : null,
  }));
};

export const getDrugDetails = async (hospitalId, drugName) => {
  const query = String(drugName || "").trim();
  if (!query) return { matches: [], message: "A drug name is required." };

  const rows = requireData(
    await supabase
      .from("drugs")
      .select("id, name, category, unit, current_stock, minimum_stock, expiry_date")
      .eq("hospital_id", hospitalId)
      .ilike("name", `%${query}%`)
      .order("name")
      .limit(10)
  );

  return { matches: rows };
};

export const getShipmentRequests = async (hospitalId) => {
  const rows = requireData(
    await supabase
      .from("shipment_requests")
      .select(requestSelect)
      .eq("hospital_id", hospitalId)
      .order("requested_at", { ascending: false })
      .limit(MAX_ROWS)
  );
  return rows.map(compactRequest);
};

export const getShipmentHistory = async (hospitalId) => {
  const rows = requireData(
    await supabase
      .from("shipments")
      .select(shipmentSelect)
      .eq("hospital_id", hospitalId)
      .order("expected_delivery", { ascending: false })
      .limit(MAX_ROWS)
  );
  return rows.map(compactShipment);
};

export const getVendors = async () => {
  return requireData(
    await supabase
      .from("vendors")
      .select("id, name, price_per_unit, reliability_score, average_delivery_days, quality_score")
      .order("name")
      .limit(MAX_ROWS)
  );
};

export const getVendorPerformance = async (hospitalId, vendorName) => {
  const [vendors, shipments] = await Promise.all([getVendors(), getShipmentHistory(hospitalId)]);
  const normalizedName = String(vendorName || "").trim().toLowerCase();
  const selectedVendors = normalizedName
    ? vendors.filter((vendor) => vendor.name.toLowerCase().includes(normalizedName))
    : vendors;

  return selectedVendors.map((vendor) => {
    const vendorShipments = shipments.filter((shipment) => shipment.vendor_id === vendor.id);
    const delivered = vendorShipments.filter((shipment) => shipment.status === "DELIVERED");
    const delayed = vendorShipments.filter((shipment) => shipment.status === "DELAYED");
    const fulfillmentRates = delivered
      .filter((shipment) => Number(shipment.expected_quantity) > 0)
      .map((shipment) => Number(shipment.quantity || 0) / Number(shipment.expected_quantity));
    const onTimeDeliveries = delivered.filter(
      (shipment) =>
        shipment.actual_delivery &&
        shipment.expected_delivery &&
        new Date(shipment.actual_delivery) <= new Date(shipment.expected_delivery)
    ).length;

    return {
      vendor: vendor.name,
      vendor_id: vendor.id,
      catalog_reliability_score: vendor.reliability_score,
      catalog_quality_score: vendor.quality_score,
      catalog_average_delivery_days: vendor.average_delivery_days,
      catalog_price_per_unit: vendor.price_per_unit,
      hospital_shipment_count: vendorShipments.length,
      delivered_count: delivered.length,
      delayed_count: delayed.length,
      on_time_rate: delivered.length
        ? Number((onTimeDeliveries / delivered.length).toFixed(2))
        : null,
      average_fulfillment_rate: fulfillmentRates.length
        ? Number((fulfillmentRates.reduce((total, rate) => total + rate, 0) / fulfillmentRates.length).toFixed(2))
        : null,
    };
  });
};

export const getDrugAssociations = async (hospitalId) => {
  const requests = await getShipmentRequests(hospitalId);

  // The current table stores one drug per request and has no order/basket identifier.
  // Without a valid basket key, co-occurrence metrics would be fabricated.
  return {
    sufficient_data: false,
    request_count: requests.length,
    associations: [],
    reason:
      "Shipment requests do not contain a shared order or basket identifier, so valid support, confidence, and lift cannot be calculated from the current schema.",
  };
};
