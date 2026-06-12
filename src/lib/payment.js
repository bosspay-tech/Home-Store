export async function createPaymentSession({
  gateway,
  collectRef,
  amount,
  customer,
}) {
  const endpoint =
    gateway === "easebuzz"
      ? "/api/easebuzz/create-payment"
      : "/api/nineteenpay/create-payment";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      collect_ref: collectRef,
      display_name: customer.name,
      email: customer.email,
      phone: customer.phone,
      user_ref: customer.phone,
      txn_note: `Order ${collectRef}`,
      productinfo: `Home Store order ${collectRef}`,
      idempotency_key: collectRef,
      address1: customer.address,
      city: customer.city,
      state: customer.state,
      zipcode: customer.pincode,
      country: "India",
    }),
  });

  return response.json();
}

export function savePaymentSession(gateway, collectRef) {
  sessionStorage.setItem("payment_gateway", gateway);
  sessionStorage.setItem("payment_collect_ref", collectRef);
}

export function orderToCustomer(order) {
  return {
    name: order.customer_name || "",
    email: order.customer_email || "",
    phone: order.customer_phone || "",
    address: order.customer_address || "",
    city: order.customer_city || "",
    state: order.customer_state || "",
    pincode: order.customer_pincode || "",
  };
}
