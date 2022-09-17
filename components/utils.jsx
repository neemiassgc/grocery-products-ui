function formatDate(date) {
  if (!date) return null;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${prependZeroIfLessThanTen(day)}/${prependZeroIfLessThanTen(month)}/${year}`
}
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