import { status as statusChecker } from "./utils"

const { isOk, isCreated, isBadRequest, isNotFound } = statusChecker

const URL = "http://localhost:8080/api/products"

async function fetchPricesByLink(link) {
  return (await fetch(`${link}`)).json()
}

async function fetchPagedProducts({ page, pageSize }) {
  return (await fetch(`${URL}?pag=${page}-${pageSize}`)).json()
}

async function fetchByBarcode(barcode) {
  return (await fetch(`${URL}/${barcode}`));
}

function cookPrices(rawPrices) {
  return {
    currentPrice: rawPrices[0].value,
    currentPriceDate: rawPrices[0].instant,
    previousPrice: rawPrices[1]?.value,
    previousPriceDate: rawPrices[1]?.instant,
  }
}

async function cookProduct(rawProduct) {
  const linkToFetchPrices = rawProduct.links[0].href;
  const { description, sequenceCode, barcode } = rawProduct
  const priceList = cookPrices(await fetchPricesByLink(linkToFetchPrices));
  const {
    currentPrice, currentPriceDate,
    previousPrice, previousPriceDate,
  } = priceList;

  return {
    description,
    sequenceCode,
    barcode,
    currentPrice,
    currentPriceDate: new Date(currentPriceDate),
    previousPrice: previousPrice ?? 0,
    previousPriceDate: previousPriceDate ? new Date(previousPriceDate) : null,
    priceDifference: previousPrice ? (currentPrice - previousPrice).toFixed(2) : null
  }
}

async function cookProducts(rawProducts) {
  const productListToReturn = [];

  for (const product of rawProducts.content)
    productListToReturn.push(await cookProduct(product));

  return productListToReturn;
}

export function getByBarcode(barcode) {
  return new Promise((resolve, reject) => {
    fetchByBarcode(barcode)
      .then(async response  => {
        const { status } = response;
        let body;

        if (isOk(status) || isCreated(status))
          body = await cookProduct(await response.json());
        else if (isBadRequest(status))
          body = await response.json();
        else if (isNotFound(status))
          body = await response.text();

        resolve({
          status,
          body,
        })
      })
      .catch(reject)
  })
}

export function getPagedProducts(pagination) {
  return new Promise((resolve, reject) => {
    fetchPagedProducts(pagination)
      .then(async jsonData => {
        resolve({
          products: await cookProducts(jsonData),
          rowCount: jsonData.totalOfItems,
        })
      })
      .catch(reject)
  })
}