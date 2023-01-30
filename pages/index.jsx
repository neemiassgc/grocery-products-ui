import { useEffect, useState, useRef } from "react"
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
  }, [])

  const searchBarRef = useRef(null);
  const alertModalRef = useRef(null);
  const scannerModalRef = useRef(null);

  return <>
      <Head>
        <title>Grocery products ui</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
      </Head>
      <header className="w-full bg-blue-500 flex h-0 md:h-72"/>
      <div className=" mt-3 md:-mt-52 flex justify-center">
        <div className="basis-full md:basis-11/12 h-[38rem] shadow-none md:shadow-2xl p-3 md:p-5 border-0 md:border rounded-md flex flex-col gap-2 bg-white">
          <SearchBar
            findByBarcodeAndOpenAlertModal={alertModalRef.current?.findByBarcodeAndLoadData}
            openScannerModal={scannerModalRef.current?.openScannerModal}
            actionRef={searchBarRef}
          />
          <DataTable/>
        </div>
      </div>
      <AlertModal showErrorOnSearchbar={searchBarRef.current?.showError} actionRef={alertModalRef} />
      {
        scannerModalAvailable &&
        <ScannerModal findByBarcodeAndOpenAlertModal={alertModalRef.current?.findByBarcodeAndLoadData} actionRef={scannerModalRef}/>
      }
  </>
}

export default App