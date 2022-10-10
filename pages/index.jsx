import { Component } from "react"
import Head from "next/head"
import DataTable from "../modules/components/datatable"
import ModalView from "../modules/components/viewmodal"
import SearchBar from "../modules/components/searchbar"

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  handleSearchByBarcode(barcode) {
    this.actions.searchByBarcode(barcode)
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
        <header className="w-full bg-blue-500 flex p-3" />
        <div className="mt-3 sm:mt-8 flex justify-center">
          <div className="basis-full md:basis-11/12 h-[38rem] shadow-none md:shadow-2xl p-3 md:p-5 border-0 md:border rounded-md flex flex-col gap-2">
            <SearchBar searchByBarcode={this.handleSearchByBarcode.bind(this)}/>
            <DataTable/>
          </div>
        </div>
        <ModalView actions={actions => this.actions = actions} />
      </>
    )
  }
}