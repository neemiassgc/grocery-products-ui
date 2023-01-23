import { Component } from "react"
import * as net from "../net"
import {
  DataGrid,
  getGridStringOperators,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';
import * as utils from "../utils"
import { ImHappy, ImSad } from "react-icons/im"
import { Chip, FormControlLabel, FormGroup, Switch, Box } from "@mui/material"
import { SiFiles } from "react-icons/si"
import { RiSignalWifiErrorFill } from "react-icons/ri"
import { IoCloudOffline } from "react-icons/io5"

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
      },
      filter: {
        operatorValue: "all",
        value: undefined,
        serverSide: false
      },
      error: {
        code: "no-items"
      },
      smallScreen: false
    }
  }

  setErrorCode(code) {
    this.setObjectState("error", { code })
  }

  setProducts(products) {
    this.setObjectState("datagrid", { products })
  }

  setIsLoading(isLoading) {
    this.setObjectState("datagrid", { isLoading })
  }

  setRowCount(rowCount) {
    this.setObjectState("pagination", { rowCount })
  }

  setPageAndLoadData(page) {
    this.setObjectState("pagination", { page })
    this.loadData({ page })
  }

  setPageSizeAndLoadData(pageSize) {
    this.setObjectState("pagination", { pageSize })
    this.loadData({ pageSize })
  }

  setFilterAndLoadData(filter) {
    const { operatorValue, value } = filter
    this.setObjectState("filter", { operatorValue, value });
    if (!this.state.filter.serverSide) return;
    this.loadData({ filter })
  }

  setSmallScreen(bool) {
    this.setState({ smallScreen: bool })
  }

  toggleFilterServerSideAndLoadData() {
    this.setState(({ filter }) => {
      return {
        filter: {
          ...filter,
          serverSide: !filter.serverSide,
        }
      }
    }, () => {
      if (this.state.filter.serverSide) this.loadData({})
      else this.loadData({filter: { operatorValue: "all" }})
    })
  }

  componentDidMount() {
    const { page, pageSize } = this.state.datagrid;
    this.loadData({ page, pageSize });

    this.setSmallScreenDetection();
  }

  componentWillUnmount() {
    if (this.mediaQueryDetection) {
      const { matchMedia, boundAction } = this.mediaQueryDetection;
      matchMedia.removeEventListener("change", boundAction)
    }
  }

  setSmallScreenDetection() {
    this.mediaQueryDetection = {
      matchMedia: window.matchMedia("(max-width: 768px)"),
      action: e => {
        if (e.matches && !this.state.smallScreen)
          this.setSmallScreen(true)
        else if (!e.matches && this.state.smallScreen)
          this.setSmallScreen(false)
      }
    }
    const { matchMedia, action } = this.mediaQueryDetection
    this.mediaQueryDetection.boundAction = action.bind(this);
    matchMedia.addEventListener("change", this.mediaQueryDetection.boundAction)
  }

  setObjectState(objectName, properties) {
    this.setState(prevState => {
      const newObject = {...prevState[objectName]}
      for (const key in properties)
        newObject[key] = properties[key]
      return {
        [objectName]: newObject
      }
    })
  }

  buildCols() {
    const valuePriceFormatter = ({ value }) => utils.priceFormatter(value);
    const valueDateformatter = ({ value }) => utils.dateFormatter(value);

    const columns = [
      {
        field: "description",
        type: "string",
        headerName: "Description",
        filterOperators: getGridStringOperators().filter(({ value }) =>
          ["contains", "startsWith", "endsWith"].includes(value)
        )
      },
      {
        field: "sequenceCode",
        filterable: false,
        type: "number",
        headerName: "Sequence Code",
        valueFormatter: null,
      },
      {
        field: "barcode",
        type: "string",
        headerName: "Barcode",
        filterable: false,
      },
      {
        field: "currentPrice",
        filterable: false,
        type: "number",
        headerName: "Current Price",
        valueFormatter: valuePriceFormatter,
        cellClassName: _ => "text-blue-700 font-bold"
      },
      {
        field: "currentPriceDate",
        filterable: false,
        type: "string",
        headerName: "Current Price Date",
        valueFormatter: valueDateformatter,
      },
      {
        field: "previousPrice",
        filterable: false,
        type: "number",
        headerName: "Previous Price",
        valueFormatter: valuePriceFormatter,
        cellClassName: _ => "font-bold",
      },
      {
        field: "previousPriceDate",
        filterable: false,
        type: "string",
        headerName: "Previous Price Date",
        valueFormatter: valueDateformatter,
      },
      {
        field: "priceDifference",
        type: "number",
        filterable: false,
        headerName: "Price difference",
        renderCell: ({ value }) => {
          if (utils.isNullOrUndefined(value)) return null;

          const settings = {
            label:  utils.priceFormatter(value),
            color:  "success",
            icon:  <ImHappy className="text-xl"/>,
          }

          if (utils.isPositive(value)) {
            settings.color = "error",
            settings.icon = <ImSad className="text-xl"/> 
          }
    
          return <Chip label={settings.label} variant="outlined" color={settings.color} icon={settings.icon}/>;
        },
        cellClassName: _ => "font-bold",
      },
    ];

    for (const col of columns) {
      col.headerAlign = "left"
      col.align = "left"
      col.width = col.field === "description" ? 300 : 150
    }

    return columns;
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

  handlePageChange(page) {
    this.loadPage({ page })
  }

  handlePageSizeChange(pageSize) {
    this.loadPage({ pageSize })
  }
  
  loadData(settings) {
    this.setIsLoading(true)
    this.selectDataFetcher(settings)()
      .then(({ products, rowCount }) => {
        this.setProducts(products);
        this.noItemsIfProductsIsEmpty(products);
        this.setIsLoading(false);
        this.setRowCount(rowCount);
      })
      .catch(err => {
        this.setIsLoading(false);
        this.treatError(err)
      })
  }

  selectDataFetcher(settings) {
    const { operatorValue, value } = settings?.filter ?? {
      operatorValue: this.state.filter.operatorValue,
      value: this.state.filter.value
    }
    const {
      page = this.state.pagination.page,
      pageSize = this.state.pagination.pageSize,
    } = settings
    const pagination = { page, pageSize };

    return {
      all: () => net.getAllProducts(pagination),
      contains: () => net.getProductsContaining(pagination, value),
      startsWith: () => net.getProductsStartingWith(pagination, value),
      endsWith: () => net.getProductsEndingWith(pagination, value),
    }[operatorValue]
  }

  noItemsIfProductsIsEmpty(products) {
    if (utils.isEmtpy(products)) this.setErrorCode("no-items")
  }

  treatError(error) {
    if (error instanceof TypeError)
      this.setErrorCode("no-connection")
    else if (error instanceof DOMException)
      this.setErrorCode("no-server")
  }

  handleFilterModalChange(filter) {
    const [values = {}] = filter.items
    this.setFilterAndLoadData({ operatorValue: values.operatorValue ?? "all", value: values.value ?? "" });
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
        columnVisibilityModel={
          this.state.smallScreen ?
          {
            barcode: false,
            previousPriceDate: false,
            currentPriceDate: false,
            sequenceCode: false
          }
          : {}
        }
        rowsPerPageOptions={[5, 10, 15, 20, 30]}
        onPageChange={this.setPageAndLoadData.bind(this)}
        onPageSizeChange={this.setPageSizeAndLoadData.bind(this)}
        onFilterModelChange={this.handleFilterModalChange.bind(this)}
        filterMode={this.state.filter.serverSide ? "server" : "client"}
        page={this.state.pagination.page}
        pageSize={this.state.pagination.pageSize}
        pagination={true}
        paginationMode="server"
        rowCount={this.state.pagination.rowCount}
        loading={this.state.datagrid.isLoading}
        components={{
          Toolbar: CustomToolBar,
          NoRowsOverlay: NoRowsOverlay,
        }}
        componentsProps={{
          toolbar: { changeServerSide: this.toggleFilterServerSideAndLoadData.bind(this) },
          noRowsOverlay: { code: this.state.error.code },
          filterPanel: { className: "w-96 sm:w-full" }
        }}
      />
    )
  }
}

function NoRowsOverlay({ code }) {
    const errorMap = {
      "no-connection": [
        <RiSignalWifiErrorFill className="w-10 h-10 text-zinc-300"/>,
        "No connection"
      ],
      "no-items": [
        <SiFiles className="w-10 h-10 text-zinc-300"/>,
        "No items"
      ],
      "no-server": [
        <IoCloudOffline className="w-10 h-10 text-zinc-300"/>,
        "Server is not responding"
      ]
    }

  return (
    <Box className="w-full h-full flex flex-col justify-center items-center">
      { errorMap[code][0] }
      <span>{ errorMap[code][1] }</span>
    </Box>
  )
}

function CustomToolBar(props) {
  return <GridToolbarContainer>
    <GridToolbarColumnsButton />
    <GridToolbarFilterButton />
    <ServerSideSwitch {...props}/>
  </GridToolbarContainer>
}

function ServerSideSwitch(props) {
  return (
    <Box className="p-1">
      <FormGroup className="w-fit ml-3">
        <FormControlLabel
          label="Server side"
          control={
            <Switch onChange={props.changeServerSide}/>
          }
        />
      </FormGroup>
    </Box>
  )
}