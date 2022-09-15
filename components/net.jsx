const URL = "http://localhost:8080/api/products"

async function fetchProducts() {
  return (await fetch(URL)).json()
}

export async function getPricesByLink(link) {
  return (await fetch(`${link}`)).json()
}

async function fetchPagedProducts({ page, pageSize }) {
  return (await fetch(`${URL}?pag=${page}-${pageSize}`)).json()
}

async function cookData(rawData) {
  const productList = rawData._embedded.List;
  const productListToReturn = [];

  for (const product of productList) {
    const linkToFetchPrices = product._links.prices.href;
    const { description, sequenceCode, barcode } = product
    const priceList = await net.getPricesByLink(linkToFetchPrices);
    const { currentPrice, currentPriceDate } = priceList[0];
    const { previousPrice = null, previousPriceDate = null} = priceList[1];

    productListToReturn.push({
      description,
      sequenceCode,
      barcode,
      currentPrice,
      currentPriceDate: new Date(currentPriceDate),
      previousPrice: previousPrice ?? 0,
      previousPriceDate: previousPriceDate ? new Date(previousPriceDate) : null,
      priceDifference: previousPrice ? (previousPrice - currentPrice).toFixed(2) : null
    })
  }

  return productListToReturn;
}

export function getProducts() {
  return cookData(getPagedProducts());
}

export function getPagedProducts(pagination) {
  return cookData(fetchPagedProducts(pagination))
}