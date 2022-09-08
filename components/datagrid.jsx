import { Component } from "react"
import * as net from "./net"
import TableGrid from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default class DataTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      products: []
    }
  }

  formatDate(date) {
    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
  }

  formatPrice(price) {
    let [integerPart, decimalPart] = (""+price).split(".");
    if (!decimalPart) decimalPart = "00"
    else if (decimalPart.length === 1) decimalPart += 0

    return `R$ ${integerPart},${decimalPart}`;
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
        currentPriceDate: new Date(prices[0].instant),
        previousPrice: prices[1]?.value ?? 0,
        previousPriceDate: prices[1] ? new Date(prices[1].instant) : null,
        priceDifference: prices[1] ? (prices[1].value - prices[0].value).toFixed(2) : null
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
          items.push(<TableCell align="left">{product[item]}</TableCell>)
        }  
        return (
          <TableRow key={++index}>{items}</TableRow>
        )
      })

    return (
      <TableContainer>
        <TableGrid component={Paper}>
          <TableHead>
            <TableRow>
              <TableCell align="left">Description</TableCell>
              <TableCell align="left">Sequence Code</TableCell>
              <TableCell align="left">Barcode</TableCell>
              <TableCell align="left">Current Price</TableCell>
              <TableCell align="left">Current Price Date</TableCell>
              <TableCell align="left">Previous Price</TableCell>
              <TableCell align="left">Previous Price Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rowsOfProducts}
          </TableBody>
        </TableGrid>
      </TableContainer>
    )
  }
}