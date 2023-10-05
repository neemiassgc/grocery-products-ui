import * as storage from "./storage"

const HOST = "https://solid-muse-378600.rj.r.appspot.com"
const RESOURCE = "/api/products";

async function fetchProducts(pagination) {
  return makeRequestQuery(pagination)
}

async function fetchProductsContaining(pagination, contains) {
  return makeRequestQuery(pagination, "&contains="+contains)
}

async function fetchProductsStartingWith(pagination, startsWith) {
  return makeRequestQuery(pagination, "&starts-with="+startsWith);
}

async function fetchProductsEndingWith(pagination, endsWith) {
  return makeRequestQuery(pagination, "&ends-with="+endsWith);
}

async function makeRequestQuery({ page, pageSize }, filterParam) {
  const req = await fetchWithTimeout(
    `${HOST+RESOURCE}?pag=${page}-${pageSize}${filterParam || ""}`,
    { withAuth: true }
  )
  return req.json()
}

async function fetchPricesByLink(link) {
  return (await fetchWithTimeout(`${link}`, { withAuth: true })).json()
}

async function fetchByBarcode(barcode) {
  return fetchWithTimeout(`${HOST+RESOURCE}/${barcode}`, { withAuth: true });
}

async function fetchWithTimeout(resource, options = {}) {
  const { withAuth = false } = options
  if (withAuth) {
    options.headers = {
      ...options.headers,
      Authorization: "bearer "+storage.getAccessToken()
    }
  }
  
  const { timeout = 10000 } = options;
  const setTimeoutId = setTimeout(_ => controller.abort(), timeout);
  const controller = new AbortController();
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  })
  clearTimeout(setTimeoutId);
  
  return new Promise(async (resolve, reject) => {
    if (response.ok) {
      resolve(response);
      return;
    }
    reject(response)
  });
}

async function cookProduct(rawProduct) {
  const linkToFetchPrices = rawProduct.links[0].href.replace("http", "https");
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

function cookPrices(rawPrices) {
  return {
    currentPrice: rawPrices[0].value,
    currentPriceDate: rawPrices[0].instant,
    previousPrice: rawPrices[1]?.value,
    previousPriceDate: rawPrices[1]?.instant,
  }
}

export async function getByBarcode(barcode) {
  const response = await fetchByBarcode(barcode);
  const { status } = response;
  const toProduct = async () => cookProduct(await response.json());
  const treatments = {
    200: toProduct,
    201:  toProduct,
    400: () => response.json(),
    404: () => response.text(),
  }
  return {
    status,
    body: await treatments[status]()
  }
}

export async function getAllProducts(pagination) {
  return getProducts(pagination, { type: "all" })
}

export async function getProductsContaining(pagination, contains) {
  return getProducts(pagination, { type: "contains", value: contains })
}

export async function getProductsStartingWith(pagination, startsWith) {
  return getProducts(pagination, { type: "startsWith", value: startsWith })
}

export async function getProductsEndingWith(pagination, endsWith) {
  return getProducts(pagination, { type: "endsWith", value: endsWith })
}

async function getProducts(pagination, metaData) {
  const promises = {
    "all": async pagination => fetchProducts(pagination),
    "contains": async (pagination, contains) => fetchProductsContaining(pagination, contains),
    "startsWith": async (pagination, startsWith) => fetchProductsStartingWith(pagination, startsWith),
    "endsWith": async (pagination, endsWith) => fetchProductsEndingWith(pagination, endsWith)
  }

  const jsonData = await promises[metaData.type](pagination, metaData?.value);

  return {
    products: await cookProducts(jsonData),
    rowCount: jsonData.totalOfItems,
  }
}

async function cookProducts(rawProducts) {
  if (rawProducts.length == 0) return [];

  const productListToReturn = [];

  for (const product of rawProducts.content)
    productListToReturn.push(await cookProduct(product));

  return productListToReturn;
}

export async function hitResourceServer() {
  return fetchWithTimeout(HOST+'/hit', {timeout: 15000, withAuth: true})
}

export async function requestAccessTokenUsingCode(code) {
  const body = {
    "grant_type": "authorization_code",
    code,
    scope: "grocerystoreapp",
    client_id: "grocerystoreapp",
    redirect_uri: window.location.origin
  }
  return requestToken(body);
}

export async function requestAccessTokenUsingRefreshToken() {
  const body = {
    grant_type: "refresh_token",
    client_id: "grocerystoreapp",
    scope: "grocerystoreapp",
    refresh_token: storage.getRefreshToken()
  }
  return requestToken(body);
}

async function requestToken(body) {
  const authUrl = storage.getRootAuthUrl();
  const path = "/realms/main/protocol/openid-connect/token"

  const req = await fetchWithTimeout(authUrl + path, {
    body: new URLSearchParams(body), 
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
  return req.json();
}