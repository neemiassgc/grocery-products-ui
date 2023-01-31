import InfoModal from "./info-modal"
import SearchBar from "./searchbar"
import ScannerModal from "./scanner-modal"
import { getByBarcode } from "../net"
import { isPossibleToScanForBarcodes, isANumber, isZero, status as statusChecker } from "../utils"
import { useEffect, useState, useRef } from "react"

export default function SearchableContainer() {
  const [scannerModalAvailable, setScannerModalAvailable] = useState(false);
  const [searchBarState, setSearchBarState] = useState({
    value: "",
    error: false,
    helperTextContent: ""
  })
  const [infoModalState, setInfoModalState] = useState({
    loading: false,
    open: false,
    content: {
      body: null,
      status: null,
    },
    netError: ""
  });

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
      findProductAndOpenInfoModal(searchBarState.value)
    }
  }

  const findProductAndOpenInfoModal = async barcode => {
    setInfoModalState({...infoModalState, loading: true});
    try {
      const { body, status } = await getByBarcode(barcode);
      if (statusChecker.isBadRequest(status)) {
        setInfoModalState({...infoModalState, loading: false});
        handleError(body.violations)
        return;
      }
      setInfoModalState({...infoModalState, netError: "", open: true, content: { body, status }});
    }
    catch (error) {
      if (error instanceof TypeError)
        setInfoModalState({...infoModalState, netError: "no-connection"});
      else if (error instanceof DOMException)
        setInfoModalState({...infoModalState, netError: "no-server"});

      setInfoModalState({...infoModalState, loading: false, open: true});
    }
  }

  function closeInfoModalAndSuppressLoading() {
    setInfoModalState({...infoModalState, loading: false, open: false});
  }

  const searchBarRef = useRef(null);
  const infoModalRef = useRef(null);
  const scannerModalRef = useRef(null);

  return (<>
    <InfoModal
      open={infoModalState.open}
      loading={infoModalState.loading}
      content={infoModalState.content}
      netError={infoModalState.netError}
      onCloseClick={closeInfoModalAndSuppressLoading}
    />
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