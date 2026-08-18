import supabase from "../config/supabase.js";
import { createShipment } from "./shipmentService.js";

const REQUEST_COLUMNS = [
  "hospital_id",
  "drug_id",
  "vendor_id",
  "requested_quantity",
  "status",
  "requested_at",
  "acknowledged_at",
];

const pickRequestFields = (data, allowedKeys) => {
  const picked = {};
  for (const key of allowedKeys) {
    if (data[key] !== undefined) {
      picked[key] = data[key];
    }
  }
  return picked;
};

const flattenRequest = (row) => ({
  ...row,
  drug_name: row.drugs?.name || "Unknown Drug",
  vendor_name: row.vendors?.name || "Unknown Vendor",
  hospital_name: row.hospitals?.name || "Unknown Hospital",
  vendor_price_per_unit: row.vendors?.price_per_unit ?? null,
  vendor_reliability_score: row.vendors?.reliability_score ?? null,
  vendor_average_delivery_days: row.vendors?.average_delivery_days ?? null,
  vendor_quality_score: row.vendors?.quality_score ?? null,
});

const REQUEST_SELECT = `
  *,
  drugs ( name ),
  vendors ( name, price_per_unit, reliability_score, average_delivery_days, quality_score ),
  hospitals ( name )
`;

export const getAllShipmentRequests = async (vendorId = null) => {
  let query = supabase
    .from("shipment_requests")
    .select(REQUEST_SELECT)
    .order("requested_at", { ascending: false });

  if (vendorId) {
    query = query.eq("vendor_id", vendorId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data.map(flattenRequest);
};

export const getShipmentRequestById = async (id) => {
  const { data, error } = await supabase
    .from("shipment_requests")
    .select(REQUEST_SELECT)
    .eq("id", id)
    .single();

  if (error) throw error;
  return flattenRequest(data);
};

export const createShipmentRequest = async (requestData) => {
  const payload = pickRequestFields(requestData, REQUEST_COLUMNS);
  payload.status = "REQUESTED";
  payload.requested_at = payload.requested_at || new Date().toISOString();

console.log("SHIPMENT REQUEST PAYLOAD:", payload);

  const { data, error } = await supabase
    .from("shipment_requests")
    .insert([payload])
    .select(REQUEST_SELECT)
    .single();

  if (error) throw error;
  return flattenRequest(data);
};

export const updateShipmentRequest = async (id, requestData) => {
  const payload = pickRequestFields(requestData, REQUEST_COLUMNS);

  if (payload.status === "ACKNOWLEDGED" && !payload.acknowledged_at) {
    payload.acknowledged_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("shipment_requests")
    .update(payload)
    .eq("id", id)
    .select(REQUEST_SELECT)
    .single();

  if (error) throw error;
  const flattened = flattenRequest(data);

  // If status is ACKNOWLEDGED, create a corresponding shipment for the hospital
  if (payload.status === "ACKNOWLEDGED") {
    try {
      await createShipment({
        drug_id: flattened.drug_id,
        vendor_id: flattened.vendor_id,
        hospital_id: flattened.hospital_id,
        quantity: flattened.requested_quantity,
        expected_quantity: flattened.requested_quantity,
        status: "IN_TRANSIT",
        expected_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // +3 days
      });
    } catch (e) {
      console.error("Failed to create shipment upon acknowledgement:", e);
    }
  }

  return flattened;
};
