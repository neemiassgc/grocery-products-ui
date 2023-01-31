import InfoModal from "./info-modal"
import SearchBar from "./searchbar"
import ScannerModal from "./scanner-modal"
import { isPossibleToScanForBarcodes, isANumber, isZero } from "../utils"
import { useEffect, useState, useRef } from "react"

export default function SearchableContainer() {
  const [scannerModalAvailable, setScannerModalAvailable] = useState(false);
  const [searchBarState, setSearchBarState] = useState({
    value: "",
    error: false,
    helperTextContent: ""
  })

  useEffect(() => {
    if (isPossibleToScanForBarcodes()) setScannerModalAvailable(true)
  }, [])

  const handleError = violations => {
    const errorFeedback = violations
      .map(violation => <p>{violation.violationMessage}</p>)

    setSearchBarState({
      ...searchBarState, helperTextContent: errorFeedback, error: true,
    });
  }

  const handleChange = ({ target: { value } }) => {
    if (searchBarState.error)
      setSearchBarState({...searchBarState, error: false, helperTextContent: ""})

    if (value.length <= 13 && isANumber(value))
      setSearchBarState({...searchBarState, value});
  }

  const handleKeyUp = ({ key }) => {
    if (key === "Enter") {
      if (isZero(searchBarState.value.length)) {
        handleError([{ violationMessage: "barcode cannot be empty" }])
        return;
      }
      // this.props.findByBarcodeAndOpenInfoModal(searchBarState.input.value)
    }
  }

  const searchBarRef = useRef(null);
  const infoModalRef = useRef(null);
  const scannerModalRef = useRef(null);

  return (<>
    <InfoModal showErrorOnSearchbar={searchBarRef.current?.showError} actionRef={infoModalRef} />
    {
      scannerModalAvailable &&
      <ScannerModal findByBarcodeAndOpenInfoModal={infoModalRef.current?.findByBarcodeAndLoadData} actionRef={scannerModalRef}/>
    }
    <SearchBar
      error={searchBarState.error}
      value={searchBarState.value}
      helperTextContent={searchBarState.helperTextContent}
      scannerButtonAvailable={scannerModalAvailable}
      onKeyUp={handleKeyUp}
      onChange={handleChange}
      // openScannerModal={scannerModalRef.current?.openScannerModal}
      actionRef={searchBarRef}
    />
  </>)
}