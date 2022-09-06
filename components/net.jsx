const URL = "http://localhost:8080/api/products"

export async function getProducts() {
  return (await fetch(URL)).json()
}