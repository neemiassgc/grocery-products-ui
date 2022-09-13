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

  mountData(pagination = null) {
    const buildStructure = async (data) => {
      const {
        _embedded: {
          List: listOfExtractedProducts
        }
      } = data;

      const listOfProducts = [];

      for (const product of listOfExtractedProducts) {
        const {
          _links: {
            prices: {
              href: link
            }
          }, barcode, sequenceCode, description
        } = product;

        const prices = await net.getPricesByLink(link);

        listOfProducts.push({
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

      this.setDatagridState({
        products: listOfProducts,
        isLoading: false,
      })

      this.setPaginationState({ rowCount: data.totalOfItems })
    }

    if (pagination)
      net
        .getPagedProducts(pagination.page, pagination.pageSize)
        .then(buildStructure)
    else net.getProducts().then(buildStructure)
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
    return this.state.datagrid.products.map((value, index) => {
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
        initialState={{
          sorting: {
            sortModel: [{ field: "description", sort: "asc" }]
          }
        }}
        rowsPerPageOptions={[5, 10, 15, 20, 30]}
        onPageChange={this.handlePageChange.bind(this)}
        onPageSizeChange={this.handlePageSizeChange.bind(this)}
        page={this.state.pagination.page}
        pageSize={this.state.pagination.pageSize}
        pagination={true}
        paginationMode="server"
        rowCount={this.state.pagination.rowCount}
        loading={this.state.datagrid.isLoading}
        getRowClassName={_ => "hover:text-purple-700"}
      />
    )
  }
}