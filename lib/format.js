// Multi-currency formatting. Base unit is ALL (Albanian Lek).
// Rates are illustrative for the demo; in production these come from an FX feed.
export const CURRENCIES = {
  ALL: { code: "ALL", symbol: "L", rate: 1, locale: "sq-AL", label: "Albanian Lek" },
  EUR: { code: "EUR", symbol: "€", rate: 0.0098, locale: "it-IT", label: "Euro" },
  USD: { code: "USD", symbol: "$", rate: 0.0106, locale: "en-US", label: "US Dollar" },
};

export function convertFromALL(amountALL, currency = "ALL") {
  const c = CURRENCIES[currency] || CURRENCIES.ALL;
  return amountALL * c.rate;
}

// Deterministic grouping (space as thousands sep, Albanian style) so server and
// client render identically — avoids React hydration mismatches.
function group(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatMoney(amountALL, currency = "ALL") {
  const c = CURRENCIES[currency] || CURRENCIES.ALL;
  const value = amountALL * c.rate;
  if (currency === "ALL") {
    return `${group(value)} L`;
  }
  const decimals = value < 1000 ? 2 : 0;
  const fixed = value.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const num = decPart ? `${grouped}.${decPart}` : grouped;
  return `${c.symbol}${num}`;
}
