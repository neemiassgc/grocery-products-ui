import { useState, useEffect } from "react"
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

export default function DataTable() {
  const [productData, setProductData] = useState({
    products: null,
    rowCount: 0,
    mustLoad: true,
  })
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 5
  })
  const [filter, setFilter] = useState({
    operatorValue: "all",
    value: undefined,
    serverSide: false
  })
  const [error, setError] = useState("noItems");

  const smallScreen = useSmallScreenMediaQuery();

  useEffect(() => {
    if (!productData.mustLoad) return;

    const selectDataFetcher = () => {
      const { operatorValue, value } = filter
  
      return {
        all: () => net.getAllProducts(pagination),
        contains: () => net.getProductsContaining(pagination, value),
        startsWith: () => net.getProductsStartingWith(pagination, value),
        endsWith: () => net.getProductsEndingWith(pagination, value),
      }[operatorValue]()
    };

    const mustShowError = error => {
      setError(error);
      setProductData({...productData, mustLoad: false});
    }

    const noItemsIfProductsIsEmpty = products => {
      if (utils.isEmpty(products)) mustShowError("noItems")
    }
  
    const treatError = error => {
      if (error instanceof TypeError)
        mustShowError("noConnection")
      else if (error instanceof DOMException)
        mustShowError("noServer")
    }

    selectDataFetcher()
      .then(({ products, rowCount }) => {
        setProductData({products, rowCount, mustLoad: false});
        noItemsIfProductsIsEmpty(products);
      })
      .catch(treatError);
  }, [pagination, filter, productData]);

  const buildCols = () => {
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

  const mustLoadProducts = () => setProductData({...productData, products: null, mustLoad: true});

  const handleFilterModalChange = filterChanges => {
    const [values = {}] = filterChanges.items
    setFilter({
      ...filter,
      operatorValue: values.operatorValue ?? "all",
      value: values.value ?? ""
    })
    if (filter.serverSide) mustLoadProducts();
  }

  const handlePageChange = page => {
    setPagination({...pagination, page});
    mustLoadProducts();
  }
  const handlePageSizeChange = pageSize => {
    setPagination({...pagination, pageSize});
    mustLoadProducts();
  }

  return (
    <DataGrid
      columns={buildCols()}
      rows={productData?.products?.map((product, idx) => ({...product, id: idx + 1})) ?? []}
      initialState={{
        sorting: {
          sortModel: [{ field: "description", sort: "asc" }]
        }
      }}
      columnVisibilityModel={
        smallScreen ?
        {
          barcode: false,
          previousPriceDate: false,
          currentPriceDate: false,
          sequenceCode: false
        }
        : {}
      }
      rowsPerPageOptions={[5, 10, 15, 20, 30]}
      onPageChange={(handlePageChange)}
      onPageSizeChange={handlePageSizeChange}
      onFilterModelChange={handleFilterModalChange}
      filterMode={filter.serverSide ? "server" : "client"}
      page={pagination.page}
      pageSize={pagination.pageSize}
      pagination={true}
      paginationMode="server"
      rowCount={productData.rowCount}
      loading={productData.mustLoad}
      components={{
        Toolbar: CustomToolBar,
        NoRowsOverlay: ErrorOverlay,
        NoResultsOverlay: ErrorOverlay,
      }}
      componentsProps={{
        toolbar: {
          changeServerSide: () => {
            setFilter({...filter, serverSide: !filter.serverSide})
            mustLoadProducts();
          }
        },
        noRowsOverlay: { code: error },
        noResultsOverlay: { code: error },
        filterPanel: { className: "w-96 sm:w-full" }
      }}
    />
  )
}

function ErrorOverlay({ code }) {
    const errorMap = {
      "noConnection": [
        <RiSignalWifiErrorFill className="w-10 h-10 text-zinc-300"/>,
        "No connection"
      ],
      "noItems": [
        <SiFiles className="w-10 h-10 text-zinc-300"/>,
        "No items"
      ],
      "noServer": [
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

function useSmallScreenMediaQuery() {
  const [smallScreen, setSmallScreen] = useState(false);

  useEffect(() => {
    if (!smallScreen && window.innerWidth <= 768)
      setSmallScreen(true);

    const updateSize = e => {
      if (e.matches && !smallScreen)
        setSmallScreen(true)
      else if (!e.matches && smallScreen)
        setSmallScreen(false)
    };
    let mediaQueryDetection = window.matchMedia("(max-width: 768px)");
    mediaQueryDetection.addEventListener("change", updateSize)

    return () => {
      if (mediaQueryDetection)
        mediaQueryDetection.removeEventListener("change", updateSize)
    }
  }, [smallScreen]);

  return smallScreen;
}