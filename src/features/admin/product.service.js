import { supabase } from "../../lib/supabase";
import { STORE_ID } from "../../config/store";

export async function fetchAllProductsAdmin() {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not configured.") };
  }

  return supabase
    .from("products")
    .select("*")
    .eq("store_id", STORE_ID)
    .order("created_at", { ascending: false });
}

export async function fetchProductForAdmin(id) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not configured.") };
  }

  return supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("store_id", STORE_ID)
    .single();
}

export async function createProduct(row) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not configured.") };
  }

  const { data, error, status } = await supabase
    .from("products")
    .insert(row)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: new Error(
        error.message ||
          (status === 401 || status === 403
            ? "Permission denied. Sign in as admin and run the Supabase RLS migration."
            : "Could not create product."),
      ),
    };
  }

  return { data, error: null };
}

export async function updateProduct(id, row) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not configured.") };
  }

  const { id: _omit, ...patch } = row;

  const { data, error, status } = await supabase
    .from("products")
    .update(patch)
    .eq("id", id)
    .eq("store_id", STORE_ID)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: new Error(
        error.message ||
          (status === 401 || status === 403
            ? "Permission denied. Sign in as admin and run the Supabase RLS migration."
            : "Could not update product."),
      ),
    };
  }

  if (!data) {
    return {
      data: null,
      error: new Error(
        "Update did not apply. Check admin permissions in Supabase RLS policies.",
      ),
    };
  }

  return { data, error: null };
}

export async function setProductActive(id, isActive) {
  return updateProduct(id, { is_active: isActive });
}
