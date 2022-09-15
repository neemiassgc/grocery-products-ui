const URL = "http://localhost:8080/api/products"

async function fetchProducts() {
  return (await fetch(URL)).json()
}

export async function getPricesByLink(link) {
  return (await fetch(`${link}`)).json()
}

export async function getPagedProducts(page, numberOfElements) {
  return (await fetch(`${URL}?pag=${page}-${numberOfElements}`)).json()
}
}