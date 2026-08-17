import supabase from "../config/supabase.js";

const SHIPMENT_COLUMNS = [
  "drug_id",
  "vendor_id",
  "hospital_id",
  "quantity",
  "expected_quantity",
  "status",
  "expected_delivery",
  "actual_delivery",
  "temperature",
];

const UPDATE_COLUMNS = [
  "quantity",
  "expected_quantity",
  "status",
  "expected_delivery",
  "actual_delivery",
  "temperature",
];

const pickFields = (data, allowedKeys) => {
  const picked = {};
  for (const key of allowedKeys) {
    if (data[key] !== undefined) {
      picked[key] = data[key];
    }
  }
  return picked;
};

export const getAllShipments = async () => {
  const { data, error } = await supabase
    .from("shipments")
    .select(`
      *,
      drugs ( name ),
      vendors ( name ),
      hospitals ( name )
    `)
    .order("expected_delivery");

  if (error) {
    // If the join fails because vendors or hospitals table doesn't exist/isn't linked,
    // fallback to a simpler query. Let's try the full join first, if error, we throw it.
    throw error;
  }

  // Flatten the response for easier frontend consumption
  return data.map(shipment => ({
    ...shipment,
    drug_name: shipment.drugs?.name || 'Unknown Drug',
    vendor_name: shipment.vendors?.name || 'Unknown Vendor',
    hospital_name: shipment.hospitals?.name || 'Unknown Hospital',
  }));
};

export const getShipmentById = async (id) => {
  const { data, error } = await supabase
    .from("shipments")
    .select(`
      *,
      drugs ( name ),
      vendors ( name ),
      hospitals ( name )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  
  return {
    ...data,
    drug_name: data.drugs?.name || 'Unknown Drug',
    vendor_name: data.vendors?.name || 'Unknown Vendor',
    hospital_name: data.hospitals?.name || 'Unknown Hospital',
  };
};

export const createShipment = async (shipmentData) => {
  const payload = pickFields(shipmentData, SHIPMENT_COLUMNS);

  const { data, error } = await supabase
    .from("shipments")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateShipment = async (id, shipmentData) => {
  const payload = pickFields(shipmentData, UPDATE_COLUMNS);

  if (Object.keys(payload).length === 0) {
    throw new Error("No valid shipment fields provided for update");
  }

  const { data, error } = await supabase
    .from("shipments")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteShipment = async (id) => {
  const { error } = await supabase
    .from("shipments")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
};
