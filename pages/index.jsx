import { Component } from "react"
import DataTable from "../components/datatable"
import { BsSearch } from "react-icons/bs"
import Head from "next/head"

function Header() {
  return (
    <header className="w-full h-8 bg-blue-600 flex items-center justify-center">
    </header>
  )
}

function SearchBar() {
  return (
    <div className="h-10 flex border my-3 rounded-lg">
      <BsSearch className="p-2 text-3xl text-dark bg-gray-100 h-10 w-10"/>
      <input className="h-full outline-none p-2 text-dark flex-grow" placeholder="Search by keyword"/>
    </div>
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
        <div className="mt-0 sm:mt-8 flex justify-center">
          <div className="basis-10/12 h-[37rem] p-3 rounded-md shadow-md">
            <SearchBar/>
            <DataTable/>
          </div>
        </div>
      </>
    )
  }
}