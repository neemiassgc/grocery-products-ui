import { Component } from "react"
import * as net from "./net"
import { DataGrid } from '@mui/x-data-grid';
import * as utils from "./utils"

export default class DataTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      datagrid: {
        products: [],
        isLoading: false,
      },
      pagination: {
        rowCount: 0,
        page: 0,
        pageSize: 5,
      }
    }
  }

  componentDidMount() {
    this.loadPage(0, 5);
  }

  setDatagridState(datagridObj) {
    this.setState(prevState => {
      for (let element in datagridObj)
        prevState.datagrid[element] = datagridObj[element]

      return {
        datagrid: prevState.datagrid
      }
    })
  }

  setPaginationState(paginationObj) {
    this.setState(prevState => {
      for (let element in paginationObj)
        prevState.datagrid[element] = paginationObj[element]

      return {
        pagination: prevState.datagrid
      }
    })
  }
  }

  buildCols() {
    const dateFormatter = ({ value }) => value ? utils.formatDate(value) : "nothing"
    const priceFormatter = ({ value }) => value ? utils.formatPrice(value) : "nothing"

    return [
      {
        field: "description", type: "string", headerName: "Description", headerAlign: "left", align: "left", width: 300,
      },
      { field: "sequenceCode", type: "number", headerName: "Sequence Code", headerAlign: "left", align: "left", width: 150 },
      { field: "barcode", type: "string", headerName: "Barcode", headerAlign: "left", align: "left", width: 150 },
      {
        field: "currentPrice", type: "number", headerName: "Current Price", headerAlign: "left", width: 150,
        valueFormatter: priceFormatter, align: "left",
      },
      {
        field: "currentPriceDate", type: "string", headerName: "Current Price Date", headerAlign: "left", align: "left", width: 150,
        valueFormatter: dateFormatter,
      },
      {
        field: "previousPrice", type: "number", headerName: "Previous Price", headerAlign: "left", align: "left", width: 150,
        valueFormatter: priceFormatter,
      },
      {
        field: "previousPriceDate", type: "string", headerName: "Previous Price Date", headerAlign: "left", align: "left", width: 150,
        valueFormatter: dateFormatter,
      },
      {
        field: "priceDifference", type: "number", headerName: "Price difference", headerAlign: "left", align: "left", width: 150,
        valueFormatter: priceFormatter,
      },
    ];
  }

  buildRows() {
    return this.state.products.map((value, index) => {
      return {
        id: index + 1,
        description: value.description,
        sequenceCode: value.sequenceCode,
        barcode: value.barcode,
        currentPrice: value.currentPrice,
        currentPriceDate: value.currentPriceDate,
        previousPrice: value.previousPrice,
        previousPriceDate: value.previousPriceDate,
        priceDifference: value.priceDifference,
      }
    });
  }

  render() {
    return (
      <DataGrid
        columns={this.buildCols()}
        rows={this.buildRows()}
      />
    )
  }
}