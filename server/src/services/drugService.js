import supabase from "../config/supabase.js";

export const getAllDrugs = async () => {
  const { data, error } = await supabase
    .from("drugs")
    .select("*")
    .order("name");

  if (error) throw error;

  return data;
};

export const getDrugById = async (id) => {
  const { data, error } = await supabase
    .from("drugs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
};

export const getLowStockDrugs = async () => {
  const { data, error } = await supabase
    .from("drugs")
    .select("*")
    .order("current_stock");

  if (error) throw error;

  return data.filter(
    (drug) => drug.current_stock <= drug.minimum_stock
  );
};