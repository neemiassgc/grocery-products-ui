import { Component } from "react"
import Table from "../components/table"
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
        </Head>
        <Header/>
        <div className="mt-16">
          <div className="w-fit mx-auto bg-gray-50 p-3 rounded-md shadow-md">
            <SearchBar/>
            <Table/>
          </div>
        </div>
      </>
    )
  }
}