import AlertModal from "./alert-modal"
import SearchBar from "./searchbar"
import ScannerModal from "./scanner-modal"
import { isPossibleToScanForBarcodes } from "../utils"
import { useEffect, useState, useRef } from "react"

function SearchableContainer() {
  const [scannerModalAvailable, setScannerModalAvailable] = useState(false);

  useEffect(() => {
    if (isPossibleToScanForBarcodes) setScannerModalAvailable(true)
  }, [])

  const searchBarRef = useRef(null);
  const alertModalRef = useRef(null);
  const scannerModalRef = useRef(null);

  return (<>
    <AlertModal showErrorOnSearchbar={searchBarRef.current?.showError} actionRef={alertModalRef} />
    {
      scannerModalAvailable &&
      <ScannerModal findByBarcodeAndOpenAlertModal={alertModalRef.current?.findByBarcodeAndLoadData} actionRef={scannerModalRef}/>
    }
    <SearchBar
      findByBarcodeAndOpenAlertModal={alertModalRef.current?.findByBarcodeAndLoadData}
      openScannerModal={scannerModalRef.current?.openScannerModal}
      actionRef={searchBarRef}
    />
  </>)
}

export default SearchableContainer;