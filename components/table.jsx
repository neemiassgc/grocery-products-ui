import { Component } from "react"
import * as net from "./net"

export default class Table extends Component {
  constructor(props) {
    super(props)
    this.state = {
      products: []
    }
  }

  async mountData() {
    const data = await net.getProducts();
    let { _embedded: { List: extractedData } } = data;
    const products = [];
    for (const product of extractedData) {
      const { _links: { prices: { href: link }}, barcode, sequenceCode, description} = product;
      const prices = await net.getPricesByLink(link);
      products.push({
        description,
        sequenceCode,
        barcode,
        currentPrice: prices[0].value,
        currentPriceDate: this.formatDate(new Date(prices[0].instant)),
        previousPrice: prices[1]?.value ?? "Nothing",
        previousPriceDate: prices[1] ? this.formatDate(new Date(prices[1].instant)) : "Nothing"
      })
    }

    this.setState({
      products: products
    })
  }

  componentDidMount() {
    this.mountData()
  }

  render() {
      const rowsOfProducts = this.state.products.map((product, index) => {
        const items = [];
        for (const item in product) {
          items.push(<td className="text-center py-3 px-0">{product[item]}</td>)
        }  
        return (
          <tr className="hover:bg-gray-100" key={index+""}>
            {items}
          </tr>
        )
      })

    return (
      <table className="table-fixed mx-auto border bg-white text-dark">
        <thead className="border-b-2">
          <tr id="tr">
            <th className="text-center p-5">Description</th>
            <th className="text-center p-5">Sequence Code</th>
            <th className="text-center p-5">Barcode</th>
            <th className="text-center p-5">Current Price</th>
            <th className="text-center p-5">Current Price Date</th>
            <th className="text-center p-5">Previous Price</th>
            <th className="text-center p-5">Previous Price Date</th>
          </tr>
        </thead>
        <tbody>
          {rowsOfProducts}
        </tbody>
      </table>
    )
  }
}