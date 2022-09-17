function formatDate(date) {
  return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
}

function formatPrice(price) {
  let [integerPart, decimalPart] = (""+price).split(".");
  if (!decimalPart) decimalPart = "00"
  else if (decimalPart.length === 1) decimalPart += 0

  return `R$ ${integerPart},${decimalPart}`;
}
}