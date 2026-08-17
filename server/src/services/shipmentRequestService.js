import supabase from "../config/supabase.js";

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

export const getAllShipmentRequests = async () => {
  const { data, error } = await supabase
    .from("shipment_requests")
    .select(REQUEST_SELECT)
    .order("requested_at", { ascending: false });

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
  return flattenRequest(data);
};
