export function dateFormatter(value) {
  return isNotNullOrUndefined(value) ? formatDate(value) : "";
}

function formatDate(date) {
  if (isNullOrUndefined(date)) return null;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${prependZeroIfLessThanTen(day)}/${prependZeroIfLessThanTen(month)}/${year}`
}

function prependZeroIfLessThanTen(number) {
  return number < 10 ? "0"+number : number;
}

export function priceFormatter(value) {
  return isNotNullOrUndefined(value) ? formatPrice(value) : "";
}

function formatPrice(price) {
  let [integerPart, decimalPart] = (""+price).split(".");
  
  if (isNullOrUndefined(decimalPart)) decimalPart = "00"
  else if (decimalPart.length === 1) decimalPart += 0

  return `R$ ${integerPart},${decimalPart}`;
}

export function isNotNullOrUndefined(obj) {
  return obj ? true : false
}

export function isNullOrUndefined(obj) {
  return !obj ? true : false
}

export function isNegative(value) {
  return value < 0
}

export function isPositive(value) {
  return value > 0
}

export function isZero(value) {
  return value === 0;
}

export function isANumber(number) {
  return /^\d*$/.test(number+"");
}

export function isEmpty(array) {
  return array.length === 0
}

export const status = {
    isOk: statusCode => statusCode === 200,
    
    isNotFound: statusCode => statusCode === 404,
    
    isBadRequest: statusCode => statusCode === 400,
    
    isCreated: statusCode => statusCode === 201,
}


export function isPossibleToScanForBarcodes() {
  if (typeof window === "undefined") return false;

  if (location.hostname !== "localhost" &&  location.protocol !== "https:") {
    console.error("The page cannot scan for barcodes because it is not running in a safe context.")
    return false;
  }
  if (!("mediaDevices" in navigator) || !("getUserMedia" in navigator.mediaDevices)) {
    console.error("The page cannot scan for barcodes because your browser lacks support for `getUserMedia`.");
    return false;
  }
  if (!("MediaStreamTrackProcessor" in window) || !("MediaStreamTrackGenerator" in window)) {
    console.error("The page cannot scan for barcodes because your browser lacks support for `MediaStreamTrackProcessor` and `MediaStreamTrackGenerator`.");
    return false;
  }
  if (!("BarcodeDetector" in window)) {
    console.error("The page cannot scan for barcodes because your browser lacks support for `BarcodeDetector`.");
    return false;
  }

  return true;
}

export function productsPlaceHolder() {
  const nullProducts = []
  for (let i = 0; i < 6; i++) {
    nullProducts.push({
      description: null,
      sequenceCode: null,
      barcode: null,
      currentPrice: null,
      currentPriceDate: null,
      previousPrice: null,
      previousPriceDate: null,
      priceDifference: null,
    })
  }
  return nullProducts;
}