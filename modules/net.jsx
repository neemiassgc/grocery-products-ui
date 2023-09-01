const HOST = "http://192.168.100.106:9000"
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
  return (await fetchWithTimeout(`${HOST+RESOURCE}?pag=${page}-${pageSize}${filterParam || ""}`)).json()
}

async function fetchPricesByLink(link) {
  return (await fetchWithTimeout(`${link}`)).json()
}

async function fetchByBarcode(barcode) {
  return fetchWithTimeout(`${HOST+RESOURCE}/${barcode}`);
}

async function fetchWithTimeout(resource, options = {}) {
  const { withAuth = false } = options
  if (withAuth) {
    options.headers = {
      ...options.headers,
      Authorization: "bearer "+localStorage.getItem("access_token")
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
    reject(await response.json())
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

export function warmup(success, error) {
  fetchWithTimeout(HOST+'/warmup', {timeout: 15000})
    .then(success).catch(error);
}

export function requestTokenWithCode(code, success, error) {
  const authUrl = localStorage.getItem("root_auth_url");
  const path = "/realms/security/protocol/openid-connect/token"
  const params = `?grant_type=authorization_code&code=${code}&scope=grocerystoreapp&redirect_uri=http://localhost:3000`
  fetch(authUrl+path+params, {method: "POST"}).then(req => req.json()).then(success).catch(error);
}