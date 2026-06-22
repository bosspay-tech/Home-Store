import { supabase } from "../../lib/supabase";

export const sendEmailOtp = async ({
  email,
  phone = "",
  fullName = "",
  shouldCreateUser = true,
}) => {
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser,
      data: {
        phone: phone.trim() || null,
        full_name: fullName.trim() || null,
      },
    },
  });
};

export const verifyEmailOtp = async ({
  email,
  token,
  phone = "",
  fullName = "",
}) => {
  const verifyResponse = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (verifyResponse.error || !verifyResponse.data?.user) {
    return verifyResponse;
  }

  const metadata = {};
  if (phone.trim()) metadata.phone = phone.trim();
  if (fullName.trim()) metadata.full_name = fullName.trim();

  if (!Object.keys(metadata).length) {
    return verifyResponse;
  }

  const updateResponse = await supabase.auth.updateUser({ data: metadata });

  if (updateResponse.error) {
    return {
      data: verifyResponse.data,
      error: updateResponse.error,
    };
  }

  return {
    data: {
      ...verifyResponse.data,
      user: updateResponse.data.user ?? verifyResponse.data.user,
    },
    error: null,
  };
};

export const signOut = () => supabase.auth.signOut();

export const loginTestUser = async ({
  email,
  fullName = "",
  phone = "",
}) => {
  let response;
  try {
    response = await fetch("/api/auth/test-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        full_name: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
      }),
    });
  } catch {
    return {
      data: null,
      error: new Error(
        "Cannot reach the bridge API. Run: npm start (or npm run dev:backend) in another terminal.",
      ),
    };
  }

  const raw = await response.text();
  let body = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    body = { error: raw.slice(0, 200) };
  }

  if (!response.ok) {
    const message =
      body.error ||
      (response.status === 404
        ? "Test login route not found. Rebuild bridge: npm run build --prefix bridge"
        : `Test login failed (HTTP ${response.status}). Ensure bridge runs on port 3000.`);
    return { data: null, error: new Error(message) };
  }

  if (body.access_token && body.refresh_token) {
    return supabase.auth.setSession({
      access_token: body.access_token,
      refresh_token: body.refresh_token,
    });
  }

  if (body.token_hash) {
    return supabase.auth.verifyOtp({
      type: "email",
      token_hash: body.token_hash,
    });
  }

  return {
    data: null,
    error: new Error("Test login did not return a session."),
  };
};
