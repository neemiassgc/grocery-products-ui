import { Component } from "react"
import DataTable from "../components/datatable"
import { BsSearch } from "react-icons/bs"
import Head from "next/head"

function Header() {
  return (
    <header className="w-full bg-blue-500 flex p-3">
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