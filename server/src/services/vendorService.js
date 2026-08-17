import supabase from "../config/supabase.js";

export const getAllVendors = async () => {
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
};

export const getVendorById = async (id) => {
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};
