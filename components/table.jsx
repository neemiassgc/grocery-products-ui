import { Component } from "react"

export default class Table extends Component {
  constructor(props) {
    super(props)
    this.state = {
      products: []
    }
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
            <th className="text-center p-5">Previous Price</th>
          </tr>
        </thead>
        <tbody>
          {rowsOfProducts}
        </tbody>
      </table>
    )
  }
}