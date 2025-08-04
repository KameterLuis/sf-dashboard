export const formatNumber = (n: number) =>
  new Intl.NumberFormat("de-DE", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);

export const formatMoney = (euro: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(euro);

export const compactNumber = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",       
    maximumFractionDigits: 1,
  }).format(n);