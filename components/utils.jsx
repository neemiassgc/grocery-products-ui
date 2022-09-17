function formatDate(date) {
  return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
}

function formatPrice(price) {
  let [integerPart, decimalPart] = (""+price).split(".");
  if (!decimalPart) decimalPart = "00"
  else if (decimalPart.length === 1) decimalPart += 0

  return `R$ ${integerPart},${decimalPart}`;
}

export function dateFormatter(value) {
  return value ? formatDate(value) : "";
}

export function priceFormatter(value) {
  return value ? formatPrice(value) : "";
}