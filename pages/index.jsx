import { Component } from "react"
import Head from "next/head"
import DataTable from "../modules/components/datatable"
import AlertModal from "../modules/components/alert-modal"
import SearchBar from "../modules/components/searchbar"
import ScannerModal from "../modules/components/scanner-modal"
import { isPossibleToScanForBarcodes } from "../modules/utils"

export default class App extends Component {
  constructor(props) {
    super(props);

    this.actions = {}

    this.state = {
      scannerModalAvailable: false
    }
  }

  componentDidMount() {
    if (isPossibleToScanForBarcodes)
      this.setScannerModalAvailable(true)
  }

  setScannerModalAvailable(bool) {
    this.setState({ scannerModalAvailable: bool })
  }

  handleSearchByBarcode(barcode) {
    this.actions.alertModal.searchByBarcode(barcode)
  }

  handleShowError(violations) {
    this.actions.searchBar.showError(violations);
  }
  
  handleShowScannerModal() {
    this.actions.openScannerModal();
  }

  render() {
    return(
      <>
        <Head>
          <title>Saveg Local Market</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
        </Head>
        <header className="w-full bg-blue-500 flex h-0 md:h-72"/>
        <div className=" mt-3 md:-mt-52 flex justify-center">
          <div className="basis-full md:basis-11/12 h-[38rem] shadow-none md:shadow-2xl p-3 md:p-5 border-0 md:border rounded-md flex flex-col gap-2 bg-white">
            <SearchBar
              searchByBarcode={this.handleSearchByBarcode.bind(this)}
              openScannerModal={this.handleShowScannerModal.bind(this)}
              actions={actions => this.actions.searchBar = actions}
            />
            <DataTable/>
          </div>
        </div>
        <AlertModal showFieldError={this.handleShowError.bind(this)} actions={actions => this.actions.alertModal = actions} />
        {
          this.state.scannerModalAvailable &&
          <ScannerModal searchByBarcode={this.handleSearchByBarcode.bind(this)} actions={({ openModal }) => this.actions.openScannerModal = openModal}/>
        }
      </>
    )
  }
}