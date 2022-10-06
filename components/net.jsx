const URL = "http://localhost:8080/api/products"

async function fetchPricesByLink(link) {
  return (await fetch(`${link}`)).json()
}

async function fetchPagedProducts({ page, pageSize }) {
  return (await fetch(`${URL}?pag=${page}-${pageSize}`)).json()
}

function cookPrices(rawPrices) {
  return {
    currentPrice: rawPrices[0].value,
    currentPriceDate: rawPrices[0].instant,
    previousPrice: rawPrices[1]?.value,
    previousPriceDate: rawPrices[1]?.instant,
  }
}

async function cookProducts(rawProducts) {
  const productList = rawProducts.content;
  const productListToReturn = [];

  for (const product of productList) {
    const linkToFetchPrices = product.links[0].href;
    const { description, sequenceCode, barcode } = product
    const priceList = cookPrices(await fetchPricesByLink(linkToFetchPrices));
    const {
      currentPrice, currentPriceDate,
      previousPrice, previousPriceDate,
    } = priceList;

    productListToReturn.push({
      description,
      sequenceCode,
      barcode,
      currentPrice,
      currentPriceDate: new Date(currentPriceDate),
      previousPrice: previousPrice ?? 0,
      previousPriceDate: previousPriceDate ? new Date(previousPriceDate) : null,
      priceDifference: previousPrice ? (currentPrice - previousPrice).toFixed(2) : null
    })
  }

  return productListToReturn;
}

export function getPagedProducts(pagination) {
  return new Promise((resolve, reject) => {
    fetchPagedProducts(pagination)
      .then(async jsonData => {
        return resolve({
          products: await cookProducts(jsonData),
          rowCount: jsonData.totalOfItems,
        })
      })
      .catch(reject)
  })
}