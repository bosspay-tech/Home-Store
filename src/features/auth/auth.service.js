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
