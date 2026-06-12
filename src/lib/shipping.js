export const FREE_SHIPPING_MIN = 999;
export const SHIPPING_RATE = 0.1;

export function roundToNearest50(amount) {
  const value = Math.max(0, Number(amount) || 0);
  return Math.round(value / 50) * 50;
}

export function getShippingQuote(subtotal) {
  const amount = Number(subtotal) || 0;
  const isFree = amount >= FREE_SHIPPING_MIN;
  const amountAwayFromFree = isFree
    ? 0
    : Math.max(0, FREE_SHIPPING_MIN - amount);

  if (isFree) {
    return {
      subtotal: amount,
      shipping: 0,
      isFree: true,
      grandTotal: amount,
      amountAwayFromFree,
    };
  }

  const estimatedTotal = amount + amount * SHIPPING_RATE;
  const grandTotal = Math.max(amount, roundToNearest50(estimatedTotal));
  const shipping = grandTotal - amount;

  return {
    subtotal: amount,
    shipping,
    isFree: false,
    grandTotal,
    amountAwayFromFree,
  };
}
