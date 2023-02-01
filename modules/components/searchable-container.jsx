import InfoModal from "./info-modal"
import SearchBar from "./searchbar"
import ScannerModal from "./scanner-modal"
import { getByBarcode } from "../net"
import { isPossibleToScanForBarcodes, isANumber, isZero, status as statusChecker } from "../utils"
import { useEffect, useState } from "react"

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
  const [openScannerModal, setOpenScannerModal] = useState(false);

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

  const findProductAndOpenInfoModal = barcode => {
    setInfoModalState({...infoModalState, loading: true});
    getByBarcode(barcode).then(({ body, status }) => {
      if (statusChecker.isBadRequest(status)) {
        setInfoModalState({...infoModalState, loading: false});
        handleError(body.violations)
        return;
      }
      setInfoModalState({...infoModalState, netError: "", open: true, content: { body, status }});
    })
    .catch(error => {
      if (error instanceof TypeError)
        setInfoModalState({...infoModalState, netError: "no-connection"});
      else if (error instanceof DOMException)
        setInfoModalState({...infoModalState, netError: "no-server"});

      setInfoModalState({...infoModalState, loading: false, open: true});
    })
  }

  function closeInfoModalAndSuppressLoading() {
    setInfoModalState({...infoModalState, loading: false, open: false});
  }

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
      <ScannerModal
        open={openScannerModal}
        onCloseClick={() => setOpenScannerModal(false)}
        findProductAndOpenInfoModal={findProductAndOpenInfoModal}
      />
    }
    <SearchBar
      error={searchBarState.error}
      value={searchBarState.value}
      helperTextContent={searchBarState.helperTextContent}
      scannerButtonAvailable={scannerModalAvailable}
      onKeyUp={handleKeyUp}
      onChange={handleChange}
      openScannerModal={() => setOpenScannerModal(true)}
    />
  </>)
}