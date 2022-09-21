import { Component } from "react"
import DataTable from "../components/datatable"
import TextField from "@mui/material/TextField"
import Head from "next/head"
import Box from "@mui/material/Box"
import InputAdornment from '@mui/material/InputAdornment';
import { BiBarcodeReader } from "react-icons/bi"

function Header() {
  return (
    <header className="w-full bg-blue-500 flex p-3">
    </header>
  )
}

function SearchBar() {
  return (
    <Box>
      <TextField
        id="outlined-basic"
        label="Search by barcode"
        variant="outlined"
        size="small"
        className="w-full"
        InputProps={{
          endAdornment: <InputAdornment position="end">
            <BiBarcodeReader
              className="text-2xl hover:text-black active:text-red-600 hover:cursor-pointer active:cursor-default"
            />
          </InputAdornment>
        }}
      />
    </Box>
  )
}

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <>
        <Head>
          <title>Saveg Local Market</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" 
          />
        </Head>
        <Header/>
        <div className="mt-3 sm:mt-8 flex justify-center">
          <div className="basis-full md:basis-11/12 h-[38rem] shadow-none md:shadow-2xl p-3 md:p-5 border-0 md:border rounded-md flex flex-col gap-2">
            <SearchBar/>
            <DataTable/>
          </div>
        </div>
      </>
    )
  }
}