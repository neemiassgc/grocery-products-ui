const URL = "http://localhost:8080/api/products"

export async function getProducts() {
  return (await fetch(URL)).json()
}

export async function getPricesByLink(link) {
  return (await fetch(`${link}&limit=2`)).json()
}

export async function getPagedProducts(page, numberOfElements) {
  return (await fetch(`${URL}?pag=${page}-${numberOfElements}`)).json()
}