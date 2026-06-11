export async function lookupPincode(pincode) {
  const cleaned = String(pincode ?? "").replace(/\D/g, "");
  if (cleaned.length !== 6) return null;

  const response = await fetch(
    `https://api.postalpincode.in/pincode/${cleaned}`,
  );

  if (!response.ok) {
    throw new Error("Unable to look up pincode right now.");
  }

  const data = await response.json();
  const result = Array.isArray(data) ? data[0] : data;

  if (result?.Status !== "Success" || !result?.PostOffice?.length) {
    return null;
  }

  const office = result.PostOffice[0];
  return {
    city: office.District || office.Name || "",
    state: office.State || "",
  };
}
