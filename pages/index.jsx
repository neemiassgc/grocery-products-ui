import { useEffect, useState } from "react"
import Head from "next/head"
import DataTable from "../modules/components/datatable"
import AlertModal from "../modules/components/alert-modal"
import SearchBar from "../modules/components/searchbar"
import ScannerModal from "../modules/components/scanner-modal"
import { isPossibleToScanForBarcodes } from "../modules/utils"

function App() {
  const [scannerModalAvailable, setScannerModalAvailable] = useState(false);

  useEffect(() => {
    if (isPossibleToScanForBarcodes) setScannerModalAvailable(true)
  })

  const [actions, setActions] = useState({})

  return <>
      <Head>
        <title>Grocery products ui</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
      </Head>
      <header className="w-full bg-blue-500 flex h-0 md:h-72"/>
      <div className=" mt-3 md:-mt-52 flex justify-center">
        <div className="basis-full md:basis-11/12 h-[38rem] shadow-none md:shadow-2xl p-3 md:p-5 border-0 md:border rounded-md flex flex-col gap-2 bg-white">
          <SearchBar
            searchByBarcode={actions?.alertModal?.searchByBarcode}
            openScannerModal={actions?.openScannerModal}
            actions={methods => setActions({...actions, ...methods})}
          />
          <DataTable/>
        </div>
      </div>
      <AlertModal showFieldError={actions?.searchbar?.showError} actions={methods => setActions({...actions, ...methods})} />
      {
        scannerModalAvailable &&
        <ScannerModal searchByBarcode={actions?.alertModal?.searchByBarcode} actions={({ openModal }) => setActions({...actions, openModal})}/>
      }
  </>
}

export default App