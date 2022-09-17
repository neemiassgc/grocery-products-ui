function formatDate(date) {
  return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
}

export function formatPrice(price) {
  const sign = price < 0 ? "-" : "+";
  price *= 1;

  let [integerPart, decimalPart] = (""+price).split(".");
  if (!decimalPart) decimalPart = "00"
  else if (decimalPart.length === 1) decimalPart += 0

  return `${sign} R$ ${integerPart},${decimalPart}`;
}